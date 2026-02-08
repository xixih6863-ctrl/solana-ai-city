import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { redisCache } from './redis.js';

interface SocketUser {
  userId: string;
  walletAddress: string;
  username: string;
}

interface Room {
  name: string;
  users: Map<string, SocketUser>;
  type: 'city' | 'guild' | 'global' | 'trade';
}

export class WebSocketServer {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();
  }

  // ============================================
  // Middleware
  // ============================================

  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          // Allow anonymous connections for public rooms
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
          userId: string;
          walletAddress: string;
        };

        socket.data.user = {
          userId: decoded.userId,
          walletAddress: decoded.walletAddress,
        } as SocketUser;

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  // ============================================
  // Event Handlers
  // ============================================

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Store user socket mapping
      if (socket.data.user) {
        this.userSockets.set(socket.data.user.userId, socket.id);
      }

      // ========================================
      // Room Management
      // ========================================

      socket.on('join_room', async (data: { roomId: string; type: string }) => {
        const { roomId, type } = data;
        
        socket.join(roomId);
        
        // Create or update room
        let room = this.rooms.get(roomId);
        if (!room) {
          room = {
            name: roomId,
            users: new Map(),
            type: type as any,
          };
          this.rooms.set(roomId, room);
        }

        if (socket.data.user) {
          room!.users.set(socket.id, socket.data.user);
        }

        // Notify others in room
        socket.to(roomId).emit('user_joined', {
          user: socket.data.user,
          roomUsers: Array.from(room!.users.values()),
        });

        // Send current room state
        socket.emit('room_state', {
          roomId,
          users: Array.from(room!.users.values()),
        });

        console.log(`User joined room: ${roomId}`);
      });

      socket.on('leave_room', (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // ========================================
      // Game Events
      // ========================================

      // City update broadcast
      socket.on('city_update', async (data: { roomId: string; cityData: any }) => {
        const { roomId, cityData } = data;
        
        // Cache the update
        await redisCache.setCity(roomId, cityData, 60);

        // Broadcast to room
        socket.to(roomId).emit('city_updated', cityData);

        // Track analytics
        await this.trackEvent(socket, 'city_update', { roomId });
      });

      // Resource collection
      socket.on('collect_resources', async (data: { roomId: string; type: string; amount: number }) => {
        const { roomId, type, amount } = data;
        
        socket.to(roomId).emit('resources_collected', {
          userId: socket.data.user?.userId,
          type,
          amount,
        });
      });

      // Building placed
      socket.on('building_placed', async (data: { roomId: string; building: any }) => {
        const { roomId, building } = data;
        
        socket.to(roomId).emit('building_added', {
          userId: socket.data.user?.userId,
          building,
        });
      });

      // ========================================
      // Chat Events
      // ========================================

      socket.on('send_message', async (data: { roomId: string; message: ChatMessage }) => {
        const { roomId, message } = data;
        
        const enrichedMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          sender: socket.data.user?.username || 'Anonymous',
          senderId: socket.data.user?.userId,
          timestamp: new Date().toISOString(),
        };

        // Cache message (last 100 messages)
        const messages = (await redisCache.get(`chat:${roomId}`)) as ChatMessage[] || [];
        messages.push(enrichedMessage);
        if (messages.length > 100) {
          messages.shift();
        }
        await redisCache.set(`chat:${roomId}`, messages, 86400);

        // Broadcast to room
        this.io.to(roomId).emit('new_message', enrichedMessage);
      });

      // ========================================
      // Trade Events
      // ========================================

      socket.on('trade_offer', async (data: { tradeId: string; toUserId: string; offer: any }) => {
        const { tradeId, toUserId, offer } = data;

        // Find recipient's socket
        const recipientSocketId = this.userSockets.get(toUserId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('trade_received', {
            tradeId,
            offer,
            fromUser: socket.data.user,
          });
        }

        // Notify global room
        this.io.to('global').emit('trade_created', {
          tradeId,
          fromUser: socket.data.user,
        });
      });

      socket.on('trade_accepted', async (data: { tradeId: string; fromUserId: string }) => {
        const { tradeId, fromUserId } = data;

        // Notify both parties
        const fromSocketId = this.userSockets.get(fromUserId);
        if (fromSocketId) {
          this.io.to(fromSocketId).emit('trade_completed', { tradeId });
        }

        const recipientSocketId = this.userSockets.get(socket.data.user?.userId || '');
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('trade_completed', { tradeId });
        }
      });

      // ========================================
      // Quest Events
      // ========================================

      socket.on('quest_progress', async (data: { questId: string; progress: any }) => {
        const { questId, progress } = data;

        // Notify friends
        this.io.to('friends:' + socket.data.user?.userId).emit('quest_updated', {
          userId: socket.data.user?.userId,
          questId,
          progress,
        });
      });

      socket.on('quest_completed', async (data: { questId: string; rewards: any }) => {
        const { questId, rewards } = data;

        // Broadcast achievement
        this.io.emit('achievement_unlocked', {
          userId: socket.data.user?.userId,
          username: socket.data.user?.username,
          questId,
          rewards,
        });
      });

      // ========================================
      // Leaderboard Events
      // ========================================

      socket.on('score_updated', async (data: { score: number }) => {
        const { score } = data;
        const user = socket.data.user;

        if (user) {
          // Update in Redis
          await redisCache.incrementLeaderboardScore('global', user.userId, score);

          // Get new rank
          const leaderboard = await redisCache.getLeaderboardRange('global', 0, 9);

          // Broadcast update
          this.io.emit('leaderboard_updated', {
            entries: leaderboard,
            updatedUser: {
              userId: user.userId,
              username: user.username,
              newScore: score,
            },
          });
        }
      });

      // ========================================
      // Disconnect Handler
      // ========================================

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Remove from all rooms
        this.rooms.forEach((room, roomId) => {
          if (room.users.has(socket.id)) {
            room.users.delete(socket.id);
            
            socket.to(roomId).emit('user_left', {
              user: room.users.get(socket.id),
              roomUsers: Array.from(room.users.values()),
            });

            // Clean up empty rooms
            if (room.users.size === 0) {
              this.rooms.delete(roomId);
            }
          }
        });

        // Remove user socket mapping
        if (socket.data.user) {
          this.userSockets.delete(socket.data.user.userId);
        }
      });
    });
  }

  // ============================================
  // Helper Methods
  // ============================================

  private handleLeaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);

      socket.to(roomId).emit('user_left', {
        user: socket.data.user,
        roomUsers: Array.from(room.users.values()),
      });

      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  private async trackEvent(socket: Socket, event: string, data: any): Promise<void> {
    try {
      await redisCache.set(`analytics:${event}:${Date.now()}`, {
        userId: socket.data.user?.userId,
        data,
        timestamp: new Date().toISOString(),
      }, 86400);
    } catch (error) {
      console.error('Track event error:', error);
    }
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.io.emit('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  // ============================================
  // Public Methods
  // ============================================

  // Broadcast to specific room
  broadcastToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  // Send to specific user
  sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Get room info
  getRoomInfo(roomId: string): { userCount: number; type: string } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return {
      userCount: room.users.size,
      type: room.type,
    };
  }

  // Get all rooms
  getAllRooms(): { id: string; userCount: number; type: string }[] {
    return Array.from(this.rooms.entries()).map(([id, room]) => ({
      id,
      userCount: room.users.size,
      type: room.type,
    }));
  }
}

// ============================================
// Type Definitions
  // ============================================

interface ChatMessage {
  id?: string;
  content: string;
  sender: string;
  senderId?: string;
  timestamp?: string;
  type: 'text' | 'system' | 'achievement' | 'trade';
}

export default WebSocketServer;

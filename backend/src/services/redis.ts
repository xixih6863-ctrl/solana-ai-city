import { createClient, RedisClientType } from 'redis';

class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      const url = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url });
      
      this.client.on('error', (err) => {
        console.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  // ============================================
  // Basic Operations
  // ============================================

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    value = await this try {
      const.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client!.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
    } catch (error) {
      console.error('Redis deletePattern error:', error);
    }
  }

  // ============================================
  // Game-Specific Caching
  // ============================================

  // Cache user data
  async getUser(userId: string): Promise<any> {
    return this.get(`user:${userId}`);
  }

  async setUser(userId: string, data: any, ttl = 300): Promise<void> {
    return this.set(`user:${userId}`, data, ttl);
  }

  async invalidateUser(userId: string): Promise<void> {
    return this.delete(`user:${userId}`);
  }

  // Cache city data
  async getCity(cityId: string): Promise<any> {
    return this.get(`city:${cityId}`);
  }

  async setCity(cityId: string, data: any, ttl = 60): Promise<void> {
    return this.set(`city:${cityId}`, data, ttl);
  }

  async invalidateCity(cityId: string): Promise<void> {
    return this.delete(`city:${cityId}`);
  }

  // Cache leaderboard
  async getLeaderboard(type: string = 'global'): Promise<any> {
    return this.get(`leaderboard:${type}`);
  }

  async setLeaderboard(type: string, data: any, ttl = 300): Promise<void> {
    return this.set(`leaderboard:${type}`, data, ttl);
  }

  // Cache quest data
  async getQuests(type?: string): Promise<any> {
    return this.get(`quests:${type || 'all'}`);
  }

  async setQuests(type: string | undefined, data: any, ttl = 600): Promise<void> {
    return this.set(`quests:${type || 'all'}`, data, ttl);
  }

  // Cache game stats
  async getGameStats(): Promise<any> {
    return this.get('game:stats');
  }

  async setGameStats(data: any, ttl = 300): Promise<void> {
    return this.set('game:stats', data, ttl);
  }

  // ============================================
  // Rate Limiting
  // ============================================

  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.isConnected) {
      return { allowed: true, remaining: maxRequests, resetTime: 0 };
    }

    try {
      const current = await this.client!.incr(`ratelimit:${key}`);
      
      if (current === 1) {
        await this.client!.expire(`ratelimit:${key}`, windowSeconds);
      }

      const remaining = Math.max(0, maxRequests - current);
      const ttl = await this.client!.ttl(`ratelimit:${key}`);

      return {
        allowed: current <= maxRequests,
        remaining,
        resetTime: ttl > 0 ? ttl * 1000 : 0,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: maxRequests, resetTime: 0 };
    }
  }

  // ============================================
  // Pub/Sub for Real-time Updates
  // ============================================

  async publish(channel: string, message: any): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client!.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('Redis publish error:', error);
    }
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void
  ): Promise<void> {
    if (!this.isConnected) return;
    try {
      const subscriber = this.client!.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        callback(JSON.parse(message));
      });
    } catch (error) {
      console.error('Redis subscribe error:', error);
    }
  }

  // ============================================
  // Session Management
  // ============================================

  async setSession(sessionId: string, data: any, ttl = 86400): Promise<void> {
    return this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.delete(`session:${sessionId}`);
  }

  // ============================================
  // Leaderboard Operations
  // ============================================

  async incrementLeaderboardScore(
    leaderboard: string,
    member: string,
    score: number
  ): Promise<number> {
    if (!this.isConnected) return score;
    try {
      return await this.client!.zIncrBy(`leaderboard:${leaderboard}`, score, member);
    } catch (error) {
      console.error('Leaderboard increment error:', error);
      return score;
    }
  }

  async getLeaderboardRange(
    leaderboard: string,
    start: number,
    stop: number
  ): Promise<{ member: string; score: number }[]> {
    if (!this.isConnected) return [];
    try {
      const results = await this.client!.zRangeWithScores(
        `leaderboard:${leaderboard}`,
        start,
        stop,
        { REV: true }
      );
      return results.map((r: any) => ({ member: r.value, score: r.score }));
    } catch (error) {
      console.error('Leaderboard range error:', error);
      return [];
    }
  }

  // ============================================
  // Connection Health
  // ============================================

  isHealthy(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string> {
    if (!this.isConnected) return 'PONG';
    try {
      return await this.client!.ping();
    } catch {
      return 'PONG';
    }
  }
}

export const redisCache = new RedisCache();

export default redisCache;

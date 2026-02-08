import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime, formatTime } from '../utils/format';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'achievement' | 'trade';
  avatar?: string;
  isOwn?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'achievement' | 'trade';
  avatar?: string;
  isOwn?: boolean;
}

interface ChatSystemProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onSendTradeOffer?: (offer: TradeOffer) => void;
  currentUser: string;
  onlineUsers?: string[];
  roomId?: string;
}

// Chat Room Component
export const ChatRoom: React.FC<ChatSystemProps> = ({
  messages,
  onSendMessage,
  currentUser,
  onlineUsers = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'trade' | 'guild'>('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const tabs = [
    { id: 'global', label: '🌍 Global', count: messages.length },
    { id: 'trade', label: '💰 Trade', count: 12 },
    { id: 'guild', label: '🏰 Guild', count: 5 },
  ];

  return (
    <div className="chat-system">
      {/* Chat Header */}
      <div className="chat-header">
        <h3>💬 Chat</h3>
        <div className="online-indicator">
          <span className="pulse"></span>
          {onlineUsers.length} online
        </div>
      </div>

      {/* Tabs */}
      <div className="chat-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`chat-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as 'global' | 'trade' | 'guild')}
          >
            {tab.label}
            {tab.count > 0 && <span className="badge">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === currentUser}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        <div className="chat-actions">
          <button className="chat-action-btn">🎁</button>
          <button className="chat-action-btn">📷</button>
          <button className="chat-action-btn">💰</button>
        </div>
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Online Users Sidebar */}
      <div className="online-users">
        <h4>Online Players</h4>
        <div className="user-list">
          {onlineUsers.map((user) => (
            <div key={user} className="online-user">
              <div className="user-avatar">{user[0].toUpperCase()}</div>
              <span className="user-name">{user}</span>
              <div className="user-status online"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage; isOwn: boolean }> = ({
  message,
  isOwn,
}) => {
  const getMessageStyle = () => {
    switch (message.type) {
      case 'system':
        return 'message-system';
      case 'achievement':
        return 'message-achievement';
      case 'trade':
        return 'message-trade';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`message-bubble ${isOwn ? 'own' : ''} ${getMessageStyle()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {!isOwn && (
        <div className="message-avatar">
          {message.avatar || message.sender[0].toUpperCase()}
        </div>
      )}
      <div className="message-content">
        {!isOwn && message.type !== 'system' && (
          <div className="message-sender">{message.sender}</div>
        )}
        <div className="message-text">{message.content}</div>
        <div className="message-time">
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

// Trade Offer Component
interface TradeOffer {
  id: string;
  fromUser: string;
  toUser: string;
  offer: {
    type: 'gold' | 'nft' | 'building';
    name: string;
    quantity: number;
    image?: string;
  };
  request: {
    type: 'gold' | 'nft' | 'building';
    name: string;
    quantity: number;
    image?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: number;
}

export const TradeOfferCard: React.FC<{
  offer: TradeOffer;
  onAccept: () => void;
  onReject: () => void;
  isIncoming: boolean;
}> = ({ offer, onAccept, onReject, isIncoming }) => {
  const timeRemaining = offer.expiresAt - Date.now();

  return (
    <motion.div
      className="trade-offer-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="trade-header">
        <div className="trade-users">
          <span className="trade-user from">{offer.fromUser}</span>
          <span className="trade-arrow">⇄</span>
          <span className="trade-user to">{offer.toUser}</span>
        </div>
        <div className="trade-timer">
          ⏰ {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="trade-details">
        <div className="trade-column">
          <h4>Offer</h4>
          <div className="trade-item">
            <span className="trade-icon">
              {offer.offer.type === 'gold' ? '💰' : '🏆'}
            </span>
            <span className="trade-name">{offer.offer.name}</span>
            <span className="trade-qty">×{offer.offer.quantity}</span>
          </div>
        </div>

        <div className="trade-separator">⇄</div>

        <div className="trade-column">
          <h4>Request</h4>
          <div className="trade-item">
            <span className="trade-icon">
              {offer.request.type === 'gold' ? '💰' : '🏆'}
            </span>
            <span className="trade-name">{offer.request.name}</span>
            <span className="trade-qty">×{offer.request.quantity}</span>
          </div>
        </div>
      </div>

      {isIncoming && offer.status === 'pending' && (
        <div className="trade-actions">
          <button className="trade-btn accept" onClick={onAccept}>
            ✅ Accept
          </button>
          <button className="trade-btn reject" onClick={onReject}>
            ❌ Reject
          </button>
        </div>
      )}

      {offer.status !== 'pending' && (
        <div className={`trade-status ${offer.status}`}>
          {offer.status === 'accepted' && '✅ Trade Complete!'}
          {offer.status === 'rejected' && '❌ Trade Declined'}
          {offer.status === 'expired' && '⏰ Offer Expired'}
        </div>
      )}
    </motion.div>
  );
};

// In-Game Notification Component
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const NotificationCenter: React.FC<{
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ notifications, onMarkRead, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="notification-header">
              <h4>📬 Notifications</h4>
              <button onClick={() => notifications.forEach((n) => onMarkRead(n.id))}>
                Mark all read
              </button>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  No notifications yet!
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'achievement' && '🏆'}
                      {notification.type === 'success' && '✅'}
                      {notification.type === 'warning' && '⚠️'}
                      {notification.type === 'error' && '❌'}
                      {notification.type === 'info' && 'ℹ️'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                    </div>
                    <button
                      className="notification-dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(notification.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Friend List Component
interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: Date;
  cityLevel?: number;
}

export const FriendList: React.FC<{
  friends: Friend[];
  onViewProfile: (friendId: string) => void;
  onSendMessage: (friendId: string) => void;
  onVisitCity: (friendId: string) => void;
}> = ({ friends, onViewProfile, onSendMessage, onVisitCity }) => {
  const onlineFriends = friends.filter((f) => f.status === 'online');
  const offlineFriends = friends.filter((f) => f.status !== 'online');

  return (
    <div className="friend-list">
      <div className="friend-header">
        <h3>👥 Friends</h3>
        <span className="friend-count">
          {onlineFriends.length}/{friends.length} online
        </span>
      </div>

      <div className="friend-sections">
        {/* Online Friends */}
        <div className="friend-section">
          <h4>Online</h4>
          {onlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onViewProfile={() => onViewProfile(friend.id)}
              onSendMessage={() => onSendMessage(friend.id)}
              onVisitCity={() => onVisitCity(friend.id)}
            />
          ))}
          {onlineFriends.length === 0 && (
            <div className="empty-state">No friends online</div>
          )}
        </div>

        {/* Offline Friends */}
        <div className="friend-section">
          <h4>Offline</h4>
          {offlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onViewProfile={() => onViewProfile(friend.id)}
              onSendMessage={() => onSendMessage(friend.id)}
              onVisitCity={() => onVisitCity(friend.id)}
              compact
            />
          ))}
        </div>
      </div>

      <button className="add-friend-btn">+ Add Friend</button>
    </div>
  );
};

// Friend Card Component
const FriendCard: React.FC<{
  friend: Friend;
  onViewProfile: () => void;
  onSendMessage: () => void;
  onVisitCity: () => void;
  compact?: boolean;
}> = ({ friend, onViewProfile, onSendMessage, onVisitCity, compact }) => {
  return (
    <div className={`friend-card ${friend.status}`}>
      <div className="friend-avatar">
        {friend.avatar || friend.username[0].toUpperCase()}
        <div className={`status-dot ${friend.status}`}></div>
      </div>
      <div className="friend-info">
        <div className="friend-name">{friend.username}</div>
        {!compact && friend.cityLevel && (
          <div className="friend-city">🏙️ City Level {friend.cityLevel}</div>
        )}
        {!compact && friend.status === 'offline' && friend.lastSeen && (
          <div className="friend-lastseen">
            Last seen {formatRelativeTime(friend.lastSeen)}
          </div>
        )}
      </div>
      {!compact && (
        <div className="friend-actions">
          <button onClick={onViewProfile} title="View Profile">👤</button>
          <button onClick={onSendMessage} title="Send Message">💬</button>
          <button onClick={onVisitCity} title="Visit City">🚗</button>
        </div>
      )}
    </div>
  );
};

// Quick Chat Emotes
export const QuickChat: React.FC<{
  onSelectEmote: (emote: string) => void;
}> = ({ onSelectEmote }) => {
  const emotes = [
    '👋', '👍', '❤️', '🎉', '🔥',
    '💰', '🏆', '🚀', '💪', '🤔',
    '😮', '😂', '😢', '😱', '✅',
  ];

  return (
    <div className="quick-chat">
      {emotes.map((emote) => (
        <button
          key={emote}
          className="quick-emote"
          onClick={() => onSelectEmote(emote)}
        >
          {emote}
        </button>
      ))}
    </div>
  );
};

export default {
  ChatRoom,
  TradeOfferCard,
  NotificationCenter,
  FriendList,
  QuickChat,
};

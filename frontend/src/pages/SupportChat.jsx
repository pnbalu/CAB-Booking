import React, { useState, useEffect } from 'react';
import { useSupportChat } from '../contexts/SupportChatContext';
import {
  FiMessageSquare,
  FiSend,
  FiX,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import './SupportChat.css';

const SupportChat = () => {
  const {
    activeChats,
    selectedChat,
    setSelectedChat,
    agents,
    sendMessage,
    closeChat,
    getChatsByAgent,
    addChat,
  } = useSupportChat();
  const [messageText, setMessageText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, waiting, connected, closed
  const [filterUserType, setFilterUserType] = useState('all'); // all, rider, driver

  // Simulate incoming chats for testing
  useEffect(() => {
    // Add test chats when component mounts (for demo purposes)
    const testRiderChat = {
      id: `chat_rider_${Date.now()}`,
      userId: 'user_rider_1',
      userName: 'John Doe',
      userType: 'rider',
      agentId: null,
      status: 'waiting',
      messages: [
        {
          id: 1,
          text: 'Hello! I need help with my ride.',
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      lastMessage: 'Hello! I need help with my ride.',
      lastMessageTime: new Date().toISOString(),
    };
    
    const testDriverChat = {
      id: `chat_driver_${Date.now() + 1}`,
      userId: 'user_driver_1',
      userName: 'Jane Smith',
      userType: 'driver',
      agentId: null,
      status: 'waiting',
      messages: [
        {
          id: 1,
          text: 'Hello! I need help with my earnings.',
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      lastMessage: 'Hello! I need help with my earnings.',
      lastMessageTime: new Date().toISOString(),
    };
    
    // Only add if they don't exist
    if (activeChats.length === 0) {
      addChat(testRiderChat);
      setTimeout(() => addChat(testDriverChat), 1000);
    }
  }, []);

  useEffect(() => {
    // Auto-select first chat if available
    if (!selectedChat && activeChats.length > 0) {
      const firstActiveChat = activeChats.find(
        (chat) => chat.status === 'connected' || chat.status === 'waiting'
      );
      if (firstActiveChat) {
        setSelectedChat(firstActiveChat);
      }
    }
  }, [activeChats, selectedChat, setSelectedChat]);

  const riderAgents = agents.filter((a) => a.userType === 'rider');
  const driverAgents = agents.filter((a) => a.userType === 'driver');
  const riderChats = activeChats.filter((c) => c.userType === 'rider');
  const driverChats = activeChats.filter((c) => c.userType === 'driver');

  const filteredChats = activeChats.filter((chat) => {
    if (filterStatus !== 'all' && chat.status !== filterStatus) return false;
    if (filterUserType !== 'all' && chat.userType !== filterUserType) return false;
    if (selectedAgent && chat.agentId !== selectedAgent) return false;
    return true;
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    sendMessage(selectedChat.id, messageText.trim(), 'agent');
    setMessageText('');

    // Update selected chat to show new message
    const updatedChat = activeChats.find((c) => c.id === selectedChat.id);
    if (updatedChat) {
      setSelectedChat(updatedChat);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="status-badge waiting">
            <FiClock size={12} /> Waiting
          </span>
        );
      case 'connected':
        return (
          <span className="status-badge connected">
            <FiCheckCircle size={12} /> Connected
          </span>
        );
      case 'closed':
        return (
          <span className="status-badge closed">
            <FiX size={12} /> Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0;
    return chat.messages.filter((m) => m.sender === 'user' && !m.read).length;
  };

  const activeChatsCount = activeChats.filter((c) => c.status !== 'closed').length;
  const waitingChatsCount = activeChats.filter((c) => c.status === 'waiting').length;

  return (
    <div className="support-chat">
      <div className="support-chat-header">
        <div>
          <h1>Support Chat</h1>
          <p>Manage customer support conversations</p>
        </div>
        <div className="chat-stats">
          <div className="stat-item">
            <span className="stat-label">Rider Chats</span>
            <span className="stat-value">{riderChats.filter((c) => c.status !== 'closed').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Driver Chats</span>
            <span className="stat-value">{driverChats.filter((c) => c.status !== 'closed').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Waiting</span>
            <span className="stat-value waiting">{waitingChatsCount}</span>
          </div>
        </div>
      </div>

      <div className="support-chat-container">
        {/* Chat List Sidebar */}
        <div className="chat-list-sidebar">
          <div className="chat-filters">
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="rider">Riders</option>
              <option value="driver">Drivers</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Chats</option>
              <option value="waiting">Waiting</option>
              <option value="connected">Connected</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value || null)}
              className="filter-select"
            >
              <option value="">All Agents</option>
              <optgroup label="Rider Support">
                {riderAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.activeChats}/{agent.maxChats})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Driver Support">
                {driverAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.activeChats}/{agent.maxChats})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="chat-list">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const unreadCount = getUnreadCount(chat);
                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''} ${
                      unreadCount > 0 ? 'unread' : ''
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-item-header">
                      <div className="chat-user-info">
                        <div className="chat-avatar">
                          <FiUser size={20} />
                        </div>
                        <div>
                          <div className="chat-user-name">
                            {chat.userName || `User ${chat.userId}`}
                            {chat.userType && (
                              <span className={`user-type-badge ${chat.userType}`}>
                                {chat.userType === 'rider' ? 'Rider' : 'Driver'}
                              </span>
                            )}
                          </div>
                          <div className="chat-meta">
                            {chat.agentId ? getAgentName(chat.agentId) : 'Unassigned'}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(chat.status)}
                    </div>
                    {chat.lastMessage && (
                      <div className="chat-preview">
                        <span className="chat-preview-text">{chat.lastMessage}</span>
                        {unreadCount > 0 && (
                          <span className="unread-badge">{unreadCount}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-chats">
                <FiMessageSquare size={48} />
                <p>No chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedChat ? (
            <>
              <div className="chat-window-header">
                <div className="chat-header-info">
                  <div className="chat-avatar large">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <div className="chat-header-name">
                      {selectedChat.userName || `User ${selectedChat.userId}`}
                    </div>
                    <div className="chat-header-meta">
                      {selectedChat.agentId ? (
                        <>Assigned to: {getAgentName(selectedChat.agentId)}</>
                      ) : (
                        <>Waiting for agent assignment</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  {getStatusBadge(selectedChat.status)}
                  {selectedChat.status !== 'closed' && (
                    <button
                      className="close-chat-btn"
                      onClick={() => closeChat(selectedChat.id)}
                      title="Close Chat"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-messages">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender === 'agent' ? 'agent-message' : 'user-message'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <FiMessageSquare size={48} />
                    <p>No messages yet</p>
                  </div>
                )}
              </div>

              {selectedChat.status !== 'closed' && (
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-chat-selected">
              <FiMessageSquare size={64} />
              <p>Select a chat to start conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;


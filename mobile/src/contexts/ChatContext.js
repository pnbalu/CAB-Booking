import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../config/appConfig';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [agentStatus, setAgentStatus] = useState(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('chat_history');
      if (stored) {
        const history = JSON.parse(stored);
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (chatId, newMessages) => {
    try {
      const updated = { ...messages, [chatId]: newMessages };
      setMessages(updated);
      await AsyncStorage.setItem('chat_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const startChat = async (userId, userName, userType = 'rider') => {
    try {
      // In a real app, this would be an API call
      // For now, we'll create a chat that can be picked up by web app agents
      const chatId = `chat_${Date.now()}`;
      const chat = {
        id: chatId,
        userId,
        userName: userName || `User ${userId}`,
        userType, // 'rider' or 'driver'
        agentId: null,
        status: 'waiting', // waiting, connected, closed
        createdAt: new Date().toISOString(),
      };
      
      setCurrentChat(chat);
      const initialMessage = {
        id: 1,
        text: `Hello! Welcome to ${appConfig.name} support. You are in queue. An agent will be with you shortly.`,
        sender: 'system',
        timestamp: new Date(),
      };
      
      setMessages((prev) => ({
        ...prev,
        [chatId]: [initialMessage],
      }));

      await saveChatHistory(chatId, [initialMessage]);

      // In a real app, this would notify the backend/websocket
      // The backend would then assign an available agent
      // For now, we'll simulate agent assignment after 2 seconds
      setTimeout(() => {
        assignAgent(chatId);
      }, 2000);

      return chat;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  };

  const assignAgent = async (chatId) => {
    // In a real app, this would check agent availability via API
    if (currentChat && currentChat.id === chatId) {
      const userType = currentChat.userType || 'rider';
      const agentId = userType === 'rider' ? 'agent_rider_1' : 'agent_driver_1';
      const agentName = userType === 'rider' ? 'Sarah' : 'John';
      const updatedChat = { ...currentChat, agentId, status: 'connected' };
      setCurrentChat(updatedChat);
      
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi! I'm ${agentName}, your ${userType} support agent. How can I help you today?`,
        sender: 'agent',
        timestamp: new Date(),
      };

      const updatedMessages = [...(messages[chatId] || []), welcomeMessage];
      setMessages((prev) => ({
        ...prev,
        [chatId]: updatedMessages,
      }));

      await saveChatHistory(chatId, updatedMessages);
    }
  };

  const sendMessage = async (chatId, text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    await saveChatHistory(chatId, [...(messages[chatId] || []), newMessage]);

    // In a real app, this would send to the backend/websocket
    return newMessage;
  };

  const endChat = async (chatId) => {
    const chat = { ...currentChat, status: 'closed' };
    setCurrentChat(null);
    
    const endMessage = {
      id: Date.now(),
      text: 'Thank you for contacting us. Have a great day!',
      sender: 'system',
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), endMessage],
    }));

    await saveChatHistory(chatId, messages[chatId] || []);
  };

  const value = {
    currentChat,
    messages,
    agentStatus,
    startChat,
    sendMessage,
    endChat,
    setCurrentChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};


import React, { createContext, useState, useContext, useEffect } from 'react';

const SupportChatContext = createContext();

export const useSupportChat = () => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error('useSupportChat must be used within a SupportChatProvider');
  }
  return context;
};

export const SupportChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [agents, setAgents] = useState([
    // Rider Support Agents
    {
      id: 'agent_rider_1',
      name: 'Sarah Johnson',
      email: 'sarah@cabooking.com',
      userType: 'rider',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
    {
      id: 'agent_rider_2',
      name: 'Michael Chen',
      email: 'michael@cabooking.com',
      userType: 'rider',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
    {
      id: 'agent_rider_3',
      name: 'Emily Rodriguez',
      email: 'emily@cabooking.com',
      userType: 'rider',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
    // Driver Support Agents
    {
      id: 'agent_driver_1',
      name: 'John Martinez',
      email: 'john@cabooking.com',
      userType: 'driver',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
    {
      id: 'agent_driver_2',
      name: 'Lisa Thompson',
      email: 'lisa@cabooking.com',
      userType: 'driver',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
    {
      id: 'agent_driver_3',
      name: 'Robert Wilson',
      email: 'robert@cabooking.com',
      userType: 'driver',
      status: 'available',
      activeChats: 0,
      maxChats: 10,
    },
  ]);

  useEffect(() => {
    loadChats();
    
    // Poll for new chats (in a real app, this would be WebSocket)
    const interval = setInterval(() => {
      loadChats();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const loadChats = async () => {
    try {
      const stored = localStorage.getItem('support_chats');
      if (stored) {
        setActiveChats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveChats = async (chats) => {
    try {
      setActiveChats(chats);
      localStorage.setItem('support_chats', JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  const getAvailableAgent = (userType = 'rider') => {
    return agents.find(
      (agent) => agent.userType === userType && agent.status === 'available' && agent.activeChats < agent.maxChats
    );
  };

  const assignChatToAgent = (chatId, agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent && agent.activeChats < agent.maxChats) {
      agent.activeChats += 1;
      if (agent.activeChats >= agent.maxChats) {
        agent.status = 'busy';
      }
      setAgents([...agents]);

      const updatedChats = activeChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, agentId, status: 'connected', assignedAt: new Date().toISOString() }
          : chat
      );
      saveChats(updatedChats);
      return true;
    }
    return false;
  };

  const releaseChatFromAgent = (chatId) => {
    const chat = activeChats.find((c) => c.id === chatId);
    if (chat && chat.agentId) {
      const agent = agents.find((a) => a.id === chat.agentId);
      if (agent) {
        agent.activeChats = Math.max(0, agent.activeChats - 1);
        if (agent.activeChats < agent.maxChats && agent.status === 'busy') {
          agent.status = 'available';
        }
        setAgents([...agents]);
      }
    }
  };

  const addChat = (chat) => {
    const newChats = [...activeChats, chat];
    saveChats(newChats);
    
    // Auto-assign to available agent based on userType
    const userType = chat.userType || 'rider';
    const availableAgent = getAvailableAgent(userType);
    if (availableAgent) {
      assignChatToAgent(chat.id, availableAgent.id);
    }
  };

  const sendMessage = (chatId, text, sender = 'agent') => {
    const chat = activeChats.find((c) => c.id === chatId);
    if (chat) {
      const newMessage = {
        id: Date.now(),
        text,
        sender,
        timestamp: new Date().toISOString(),
      };

      const updatedChats = activeChats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...(c.messages || []), newMessage],
              lastMessage: text,
              lastMessageTime: new Date().toISOString(),
            }
          : c
      );
      saveChats(updatedChats);
      return newMessage;
    }
  };

  const closeChat = (chatId) => {
    releaseChatFromAgent(chatId);
    const updatedChats = activeChats.map((c) =>
      c.id === chatId ? { ...c, status: 'closed', closedAt: new Date().toISOString() } : c
    );
    saveChats(updatedChats);
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const getChatsByAgent = (agentId) => {
    return activeChats.filter((chat) => chat.agentId === agentId && chat.status !== 'closed');
  };

  const value = {
    activeChats,
    selectedChat,
    setSelectedChat,
    agents,
    addChat,
    sendMessage,
    closeChat,
    assignChatToAgent,
    releaseChatFromAgent,
    getChatsByAgent,
    getAvailableAgent,
  };

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  );
};

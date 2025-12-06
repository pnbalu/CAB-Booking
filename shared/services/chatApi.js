// Shared chat API service
// In a real app, this would be actual API calls to a backend server
// For now, we'll use localStorage (web) and AsyncStorage (mobile) with a shared structure

// This simulates a backend API for chat functionality
export const chatApi = {
  // Create a new chat
  createChat: async (userId, userName) => {
    const chat = {
      id: `chat_${Date.now()}`,
      userId,
      userName,
      agentId: null,
      status: 'waiting',
      messages: [
        {
          id: 1,
          text: 'Hello! Welcome to CAB Booking support. You are in queue. An agent will be with you shortly.',
          sender: 'system',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      lastMessage: 'Hello! Welcome to CAB Booking support. You are in queue. An agent will be with you shortly.',
      lastMessageTime: new Date().toISOString(),
    };

    // In web app, save to localStorage
    if (typeof window !== 'undefined') {
      const chats = JSON.parse(localStorage.getItem('support_chats') || '[]');
      chats.push(chat);
      localStorage.setItem('support_chats', JSON.stringify(chats));
    }

    return chat;
  },

  // Get all chats
  getAllChats: async () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('support_chats') || '[]');
    }
    return [];
  },

  // Send a message
  sendMessage: async (chatId, text, sender) => {
    const message = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const chats = JSON.parse(localStorage.getItem('support_chats') || '[]');
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        chat.messages = chat.messages || [];
        chat.messages.push(message);
        chat.lastMessage = text;
        chat.lastMessageTime = new Date().toISOString();
        localStorage.setItem('support_chats', JSON.stringify(chats));
      }
    }

    return message;
  },

  // Assign agent to chat
  assignAgent: async (chatId, agentId) => {
    if (typeof window !== 'undefined') {
      const chats = JSON.parse(localStorage.getItem('support_chats') || '[]');
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        chat.agentId = agentId;
        chat.status = 'connected';
        chat.assignedAt = new Date().toISOString();
        localStorage.setItem('support_chats', JSON.stringify(chats));
      }
    }
    return true;
  },

  // Close chat
  closeChat: async (chatId) => {
    if (typeof window !== 'undefined') {
      const chats = JSON.parse(localStorage.getItem('support_chats') || '[]');
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        chat.status = 'closed';
        chat.closedAt = new Date().toISOString();
        localStorage.setItem('support_chats', JSON.stringify(chats));
      }
    }
    return true;
  },
};


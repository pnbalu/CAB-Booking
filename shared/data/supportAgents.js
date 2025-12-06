// Shared support agents data structure
// This can be used by both web and mobile apps
// Agents are separated by userType: 'rider' or 'driver'

export const supportAgents = [
  // Rider Support Agents
  {
    id: 'agent_rider_1',
    name: 'Sarah Johnson',
    email: 'sarah@cabooking.com',
    userType: 'rider', // 'rider' or 'driver'
    status: 'available', // available, busy, offline
    activeChats: 0,
    maxChats: 10,
    avatar: null,
  },
  {
    id: 'agent_rider_2',
    name: 'Michael Chen',
    email: 'michael@cabooking.com',
    userType: 'rider',
    status: 'available',
    activeChats: 0,
    maxChats: 10,
    avatar: null,
  },
  {
    id: 'agent_rider_3',
    name: 'Emily Rodriguez',
    email: 'emily@cabooking.com',
    userType: 'rider',
    status: 'available',
    activeChats: 0,
    maxChats: 10,
    avatar: null,
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
    avatar: null,
  },
  {
    id: 'agent_driver_2',
    name: 'Lisa Thompson',
    email: 'lisa@cabooking.com',
    userType: 'driver',
    status: 'available',
    activeChats: 0,
    maxChats: 10,
    avatar: null,
  },
  {
    id: 'agent_driver_3',
    name: 'Robert Wilson',
    email: 'robert@cabooking.com',
    userType: 'driver',
    status: 'available',
    activeChats: 0,
    maxChats: 10,
    avatar: null,
  },
];

export const getAvailableAgent = (userType = 'rider') => {
  return supportAgents.find(
    (agent) => agent.userType === userType && agent.status === 'available' && agent.activeChats < agent.maxChats
  );
};

export const assignChatToAgent = (agentId) => {
  const agent = supportAgents.find((a) => a.id === agentId);
  if (agent && agent.activeChats < agent.maxChats) {
    agent.activeChats += 1;
    if (agent.activeChats >= agent.maxChats) {
      agent.status = 'busy';
    }
    return agent;
  }
  return null;
};

export const releaseChatFromAgent = (agentId) => {
  const agent = supportAgents.find((a) => a.id === agentId);
  if (agent) {
    agent.activeChats = Math.max(0, agent.activeChats - 1);
    if (agent.activeChats < agent.maxChats && agent.status === 'busy') {
      agent.status = 'available';
    }
    return agent;
  }
  return null;
};

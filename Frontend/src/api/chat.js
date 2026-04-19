import api from './axiosInstance';

export const getChatUsers = async () => {
  const response = await api.get('/api/chat/users');
  return response.data;
};

export const getChatHistory = async (targetId) => {
  const response = await api.get(`/api/chat/history/${targetId}`);
  return response.data;
};

export const sendMessage = async (receiverId, content) => {
  const response = await api.post('/api/chat/send', { receiverId, content });
  return response.data;
};

import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isStreaming: false,

  // Fetch all chats
  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/chat');
      set({ chats: response.data.chats, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      set({ isLoading: false });
    }
  },

  // Fetch specific chat
  fetchChat: async (chatId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/chat/${chatId}`);
      set({ currentChat: response.data.chat, isLoading: false });
      return response.data.chat;
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Create new chat
  createChat: async (message) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/chat', { message });
      const { chat } = response.data;
      
      set(state => ({
        chats: [chat, ...state.chats],
        currentChat: chat,
        isLoading: false
      }));
      
      return chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Send message to existing chat
  sendMessage: async (chatId, message) => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, { message });
      
      // Update current chat with new messages
      set(state => ({
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: [
            ...state.currentChat.messages,
            { role: 'user', content: message },
            { role: 'assistant', content: response.data.message }
          ]
        } : null
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Stream message response
  streamMessage: async (chatId, message, onChunk) => {
    set({ isStreaming: true });
    
    try {
      const response = await fetch(`/api/chat/${chatId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state.token : ''}`
        },
        body: JSON.stringify({ message })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // Add user message immediately
      set(state => ({
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: [
            ...state.currentChat.messages,
            { role: 'user', content: message }
          ]
        } : null
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chunk) {
                fullResponse += data.chunk;
                onChunk(data.chunk);
              }
              
              if (data.done) {
                // Add assistant message to chat
                set(state => ({
                  currentChat: state.currentChat ? {
                    ...state.currentChat,
                    messages: [
                      ...state.currentChat.messages,
                      { role: 'assistant', content: fullResponse }
                    ]
                  } : null,
                  isStreaming: false
                }));
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      set({ isStreaming: false });
      throw error;
    }
  },

  // Update chat title
  updateChatTitle: async (chatId, title) => {
    try {
      const response = await api.put(`/chat/${chatId}/title`, { title });
      
      set(state => ({
        chats: state.chats.map(chat => 
          chat._id === chatId ? { ...chat, title } : chat
        ),
        currentChat: state.currentChat?._id === chatId 
          ? { ...state.currentChat, title }
          : state.currentChat
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to update chat title:', error);
      throw error;
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      
      set(state => ({
        chats: state.chats.filter(chat => chat._id !== chatId),
        currentChat: state.currentChat?._id === chatId ? null : state.currentChat
      }));
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  },

  // Public chat (no authentication)
  publicChat: async (message) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/chat/public/chat', { message });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Public chat failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Clear current chat
  clearCurrentChat: () => {
    set({ currentChat: null });
  },

  // Set current chat
  setCurrentChat: (chat) => {
    set({ currentChat: chat });
  }
}));

export default useChatStore; 
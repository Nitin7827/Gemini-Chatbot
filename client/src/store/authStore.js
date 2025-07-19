import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.error || 'Login failed' 
          };
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { 
            username, 
            email, 
            password 
          });
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.error || 'Registration failed' 
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
      },

      updateProfile: async (updates) => {
        try {
          const response = await api.put('/auth/profile', updates);
          const { user } = response.data;
          
          set({ user });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.error || 'Profile update failed' 
          };
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return false;
        
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore; 
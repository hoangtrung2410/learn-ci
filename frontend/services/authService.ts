
import { API_BASE_URL } from '../constants';
import { User } from '../types';
import axiosInstance from './axiosInstance';
export const authService = {

  loginWithGithub: async (): Promise<any> => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/github/url`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('loginWithGithub: backend error', resp.status, text);
        throw new Error(`Auth endpoint returned ${resp.status}`);
      }

      const data = await resp.json();
      return data;
    } catch (err) {
      console.error('loginWithGithub failed', err);
      throw err;
    }
  },

  loginWithEmail : async (email: string, password: string): Promise<any> => {
    try {
      const resp = await axiosInstance.post('/auth/login', { email, password });
      const data = resp.data;

      // Normalize nested shapes: { data: { accessToken, ... } } or direct
      const body = data?.data ?? data;
      const accessToken = body?.accessToken ?? body?.token ?? null;
      const refreshToken = body?.refreshToken ?? null;

      if (accessToken) {
        try {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          // ensure axiosInstance sends Authorization header for subsequent requests
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (e) {
          console.warn('Failed to persist tokens from login response', e);
        }
      }

      return data;
    } catch (err) {
      console.error('loginWithEmail failed', err);
      throw err;
    }
  },

  fetchCurrentUser: async (): Promise<User | null> => {
    try {
      // Read token directly from storage and attach explicitly to avoid timing issues
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await axiosInstance.get('/users/me/profile', { headers });
      const data = resp.data;
      return data?.user ?? data ?? null;
    } catch (err) {
      console.warn('fetchCurrentUser failed', err);
      return null;
    }
  },


  getUserFromUrl: (): User | null => {
    const params = new URLSearchParams(window.location.search);
    const userStr = params.get('user');

    if (userStr) {
      try {
        const decodedStr = decodeURIComponent(userStr);
        const userData: User = JSON.parse(decodedStr);
        
        // Clean the URL to remove the sensitive user param
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return userData;
      } catch (e) {
        console.error("Failed to parse user data from URL", e);
        return null;
      }
    }
    return null;
  }
};

import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Cognito JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('No active session or failed to fetch token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

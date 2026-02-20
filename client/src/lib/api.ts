import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get Clerk token (will be set by the component using the API)
let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (tokenGetter: () => Promise<string | null>) => {
  getClerkToken = tokenGetter;
};

// Add token to requests
api.interceptors.request.use(async (config) => {
  if (getClerkToken) {
    const token = await getClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

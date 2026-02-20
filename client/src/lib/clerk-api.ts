'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import api, { setClerkTokenGetter } from './api';

// Hook to use API with Clerk authentication
export function useApi() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for API interceptor
    setClerkTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        return null;
      }
    });
  }, [getToken]);

  return api;
}

export default api;

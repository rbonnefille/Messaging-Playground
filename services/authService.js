import { requestJson } from '@/services/apiClient';

export const requestAuthToken = userData =>
  requestJson('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

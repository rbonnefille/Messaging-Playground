import { requestJson } from '@/services/apiClient';

export const requestAuthToken = userData =>
  requestJson('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

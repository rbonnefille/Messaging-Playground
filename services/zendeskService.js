import { requestJson } from '@/services/apiClient';

export const requestZendeskLogin = userData =>
  requestJson('/api/zendesk/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

export const searchHelpCenterArticles = query =>
  requestJson(
    `https://z3nsuncoswitchboard.zendesk.com/api/v2/help_center/articles/search.json?query=${encodeURIComponent(query)}`,
  );

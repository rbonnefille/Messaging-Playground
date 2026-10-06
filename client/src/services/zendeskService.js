import { requestJson } from '@/services/apiClient';

export const requestZendeskLogin = (userData) =>
    requestJson('/zendesk/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

export const searchHelpCenterArticles = (query) =>
    requestJson(
        `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/help_center/articles/search.json?query=${encodeURIComponent(query)}`
    );

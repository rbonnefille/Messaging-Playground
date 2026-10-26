import { getAccessToken } from './zendeskOAuth.js';

const subdomain = process.env.ZENDESK_SUBDOMAIN;

export async function getTickets() {
    const token: string = await getAccessToken();

    const response = await fetch(
        `https://${subdomain}.zendesk.com/api/v2/tickets.json`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Zendesk API failed (${response.status})`);
    }

    return response.json();
}

export async function searchUser(externalId: string) {
    const token: string = await getAccessToken();

    const response = await fetch(
        `https://${subdomain}.zendesk.com/api/v2/users/search?query=external_id:${externalId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Zendesk API failed (${response.status})`);
    }

    return await response.json();
}
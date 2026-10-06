import { requestJson } from '@/services/apiClient';

export const fetchConversations = userId =>
  requestJson(`/users/${userId}/conversations`);

export const fetchSuncoUser = async userId => {
  const [user, clients, conversations, devices] = await Promise.all([
    requestJson(`/users/${userId}`),
    requestJson(`/users/${userId}/clients`),
    requestJson(`/users/${userId}/conversations`),
    requestJson(`/users/${userId}/devices`),
  ]);

  return {
    user: user.user,
    clients: clients.clients,
    conversations: conversations.conversations,
    devices: devices.devices,
  };
};

export const fetchUserIdentity = email =>
  requestJson('/users/listUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email.trim() }),
  });

export const fetchIntegrations = () => requestJson('/integrations');

export const updateIntegration = (
  integrationId,
  canUserCreateMoreConversations,
  canUserSeeConversationList,
  defaultResponderId,
) =>
  requestJson(`/integrations/${integrationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      canUserCreateMoreConversations,
      canUserSeeConversationList,
      defaultResponderId,
    }),
  });

export const updateSwitchboard = (
  enabled = true,
  defaultSwitchboardIntegrationId,
) =>
  requestJson('/switchboards', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      enabled: Boolean(enabled),
      defaultSwitchboardIntegrationId,
    }),
  });

export const updateSwitchboardIntegration = (
  switchboardIntegrationId,
  nextSwitchboardIntegrationId,
  messageHistoryCount,
  deliverStandbyEvents,
) =>
  requestJson('/switchboards/switchboardIntegration', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      switchboardIntegrationId,
      nextSwitchboardIntegrationId,
      messageHistoryCount,
      deliverStandbyEvents,
    }),
  });

export const fetchSwitchboardIntegrations = async () => {
  const [integrationData, switchboardData] = await Promise.all([
    requestJson('/switchboards/switchboardIntegration'),
    requestJson('/switchboards'),
  ]);

  return {
    switchboardIntegrations: integrationData.switchboardIntegrations,
    switchboards: switchboardData.switchboards,
  };
};

export const createSwitchboardIntegration = (
  integrationName,
  integrationId,
  deliverStandbyEvents,
  nextSwitchboardIntegrationId,
  messageHistoryCount,
) =>
  requestJson('/switchboards/switchboardIntegration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      integrationName,
      integrationId,
      deliverStandbyEvents,
      nextSwitchboardIntegrationId,
      messageHistoryCount,
    }),
  });

export const deleteConversations = userId =>
  requestJson(`/users/${userId}/conversations`, {
    method: 'DELETE',
  });

export const createConversationApi = body =>
  requestJson('/conversations/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

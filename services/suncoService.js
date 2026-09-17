import { requestJson } from '@/services/apiClient';

export const fetchConversations = userId =>
  requestJson(`/api/users/${userId}/conversations`);

export const fetchSuncoUser = async userId => {
  const [user, clients, conversations, devices] = await Promise.all([
    requestJson(`/api/users/${userId}`),
    requestJson(`/api/users/${userId}/clients`),
    requestJson(`/api/users/${userId}/conversations`),
    requestJson(`/api/users/${userId}/devices`),
  ]);

  return {
    user: user.user,
    clients: clients.clients,
    conversations: conversations.conversations,
    devices: devices.devices,
  };
};

export const fetchUserIdentity = email =>
  requestJson('/api/users/listUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email.trim() }),
  });

export const fetchIntegrations = () => requestJson('/api/integrations');

export const updateIntegration = (
  integrationId,
  canUserCreateMoreConversations,
  canUserSeeConversationList,
  defaultResponderId,
) =>
  requestJson(`/api/integrations/${integrationId}`, {
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
  requestJson('/api/switchboards', {
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
  requestJson('/api/switchboards/switchboardIntegration', {
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
    requestJson('/api/switchboards/switchboardIntegration'),
    requestJson('/api/switchboards'),
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
  requestJson('/api/switchboards/switchboardIntegration', {
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
  requestJson(`/api/users/${userId}/conversations`, {
    method: 'DELETE',
  });

/* eslint-disable no-undef */
require('dotenv').config();

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration
  } = process.env;

function isAuthenticatedRequest(webhookEventApiKey) {
    return webhookEventApiKey === webhookConversationsSecret;
}

function isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
    return activeSwitchboardIntegration === botSwitchboardIntegration;
}

function isUserMessage(author) {
    return author === "user";
}

function isTextMessage(content) {
    return content === "text";
}


module.exports = { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isTextMessage };
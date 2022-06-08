/* eslint-disable no-undef */
require('dotenv').config();

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration
  } = process.env;

class Utils {
    constructor() {
        this.webhookConversationsSecret = webhookConversationsSecret;
        this.botSwitchboardIntegration = botSwitchboardIntegration;
      }
    isAuthenticatedRequest(webhookConversationsSecret) {
        return webhookConversationsSecret === this.webhookConversationsSecret;
    }
    isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
        return activeSwitchboardIntegration === this.botSwitchboardIntegration;
    }
    isUserMessage(authorType) {
        return authorType === "user";
    }
    isTextMessage(contentType) {
        return contentType === "text";
    }
}

module.exports = Utils;
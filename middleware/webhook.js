require('dotenv').config();

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration
  } = process.env;

class WebhookEvent {
    constructor(reqBody) {
        this.appId = reqBody.app.id;
        this.webhookId = reqBody.webhook.id;
        this.webhookVersion = reqBody.webhook.version;
        this.events = reqBody.events;
        this.eventId = reqBody.events[0].id;
        this.eventCreatedAt = reqBody.events[0].createdAt;
        this.eventType = reqBody.events[0].type;
        this.eventPayload = reqBody.events[0].payload;
        this.conversationId = reqBody.events[0].payload.conversation.id;
        this.conversationType = reqBody.events[0].payload.conversation.type;
        this.activeSwitchboardIntegrationId = reqBody.events[0].payload.conversation.activeSwitchboardIntegration.id;
        this.activeSwitchboardIntegrationName = reqBody.events[0].payload.conversation.activeSwitchboardIntegration.name;
        this.activeSwitchboardIntegrationIntegrationId = reqBody.events[0].payload.conversation.activeSwitchboardIntegration.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = reqBody.events[0].payload.conversation.activeSwitchboardIntegration.integrationType;
    }
    isAuthenticatedRequest(webhookSecret) {
        return webhookSecret === webhookConversationsSecret;
    }
    isCurrentSwitchboardIntegration(activeSwitchboardIntegration){
        return activeSwitchboardIntegration === botSwitchboardIntegration;
    }
}

class ConversationCreate extends WebhookEvent {
    constructor(reqBody) {
        super(reqBody);
        this.userId = reqBody.events[0].payload.user?.id;
        this.userExternalId = reqBody.events[0].payload.user?.externalId;
        this.creationReason = reqBody.events[0].payload.creationReason;
        this.sourceType = reqBody.events[0].payload.source.type;
        this.sourceIntegrationId = reqBody.events[0].payload.source.integrationId;
    }
    isConversationCreate() {
        return this.eventType === "conversation:create";
    }
    isCreationReasonStartConversation() {
        return this.creationReason === "startConversation";
    }
    isIgnoredChannel() {
        return this.sourceType === "twitter" || this.sourceType === "instagram" || this.sourceType === "web";
    }
}

class ConversationMessage extends WebhookEvent {
    constructor(reqBody) {
        super(reqBody);
        this.messageId = reqBody.events[0].payload.message.id;
        this.receivedAt = reqBody.events[0].payload.message.received;
        this.authorId = reqBody.events[0].payload.message.author.userId;
        this.avatarUrl = reqBody.events[0].payload.message.author?.avatarUrl;
        this.displayName = reqBody.events[0].payload.message.author?.displayName;
        this.authorType = reqBody.events[0].payload.message.author?.type;
        this.userId = reqBody.events[0].payload.message.author.user?.id;
        this.userExternalId = reqBody.events[0].payload.message.author.user?.externalId;
        this.givenName = reqBody.events[0].payload.message.author.user?.profile.givenName;
        this.email = reqBody.events[0].payload.message.author.user?.profile.email;
        this.locale = reqBody.events[0].payload.message.author.user?.profile.locale;
        this.signedUpAt = reqBody.events[0].payload.message.author.user?.signedUpAt;
        this.userMetadata = reqBody.events[0].payload.message.author.user?.metadata;
        this.contentType = reqBody.events[0].payload.message.content.type;
        this.userMessage = reqBody.events[0].payload.message.content.text;
        this.sourceIntegrationId = reqBody.events[0].payload.message.source.integrationId;
        this.sourceType = reqBody.events[0].payload.message.source.type;
    }
    isConversationMessage() {
        return this.eventType === "conversation:message";
    }
    isUserMessage() {
        return this.authorType === "user";
    }
    isTextMessage() {
        return this.contentType === "text";
    }
}

module.exports = {
    ConversationCreate,
    ConversationMessage
};
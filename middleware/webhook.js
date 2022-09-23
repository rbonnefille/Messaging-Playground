const { env } = require('process');

require('dotenv').config();

class WebhookEvent {
    constructor(req) {
        this.webhookEventApiKey = req.headers["x-api-key"];
        this.appId = req.body.app.id;
        this.webhookId = req.body.webhook.id;
        this.webhookVersion = req.body.webhook.version;
        this.events = req.body.events;
        this.eventId = req.body.events[0].id;
        this.eventCreatedAt = req.body.events[0].createdAt;
        this.eventType = req.body.events[0].type;
        this.eventPayload = req.body.events[0].payload;
        this.conversationId = req.body.events[0].payload.conversation.id;
        this.conversationType = req.body.events[0].payload.conversation.type;
        this.activeSwitchboardIntegrationId = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.integrationType;
    }
    isAuthenticatedRequest(webhookSecret) {
        return webhookSecret === process.env.WEBHOOK_CONVERSATIONS_CREATE_SECRET || webhookSecret === process.env.WEBHOOK_CONVERSATIONS_MESSAGE_SECRET;
    }
    isCurrentSwitchboardIntegration(activeSwitchboardIntegration){
        return activeSwitchboardIntegration === process.env.BOT_SWITCHBOARD_INTEGRATION_ID;
    }
}

class ConversationCreate extends WebhookEvent {
    constructor(req) {
        super(req);
        this.userId = req.body.events[0].payload.user?.id;
        this.userExternalId = req.body.events[0].payload.user?.externalId;
        this.creationReason = req.body.events[0].payload.creationReason;
        this.sourceType = req.body.events[0].payload.source.type;
        this.sourceIntegrationId = req.body.events[0].payload.source.integrationId;
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
    constructor(req) {
        super(req);
        this.messageId = req.body.events[0].payload.message.id;
        this.receivedAt = req.body.events[0].payload.message.received;
        this.authorId = req.body.events[0].payload.message.author.userId;
        this.avatarUrl = req.body.events[0].payload.message.author?.avatarUrl;
        this.displayName = req.body.events[0].payload.message.author?.displayName;
        this.authorType = req.body.events[0].payload.message.author?.type;
        this.userId = req.body.events[0].payload.message.author.user?.id;
        this.userExternalId = req.body.events[0].payload.message.author.user?.externalId;
        this.givenName = req.body.events[0].payload.message.author.user?.profile.givenName;
        this.email = req.body.events[0].payload.message.author.user?.profile.email;
        this.locale = req.body.events[0].payload.message.author.user?.profile.locale;
        this.signedUpAt = req.body.events[0].payload.message.author.user?.signedUpAt;
        this.userMetadata = req.body.events[0].payload.message.author.user?.metadata;
        this.contentType = req.body.events[0].payload.message.content.type;
        this.userMessage = req.body.events[0].payload.message.content.text;
        this.sourceIntegrationId = req.body.events[0].payload.message.source.integrationId;
        this.sourceType = req.body.events[0].payload.message.source.type;
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
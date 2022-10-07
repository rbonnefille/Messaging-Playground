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
        this.payload = req.body.events[0].payload;
        this.message = this.payload.message;
        this.conversationId = this.payload.conversation.id;
        this.conversationType = this.payload.conversation.type;
        this.activeSwitchboardIntegrationId = this.payload.conversation.activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName = this.payload.conversation.activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId = this.payload.conversation.activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = this.payload.conversation.activeSwitchboardIntegration?.integrationType;        
    }

    isAuthenticatedRequest(webhookSecret) {
        return webhookSecret === process.env.WEBHOOK_SUNCO;
    }
    isCurrentSwitchboardIntegration(activeSwitchboardIntegration){
        return activeSwitchboardIntegration === process.env.BOT_SWITCHBOARD_INTEGRATION_ID;
    }
    isAllowedChannel(){
        switch (this.eventType) {
            case "conversation:message":
                return this.message.source.type !== "api:conversations";
            case "conversation:create":
                return this.payload.source.type === "android" || this.payload.source.type === "ios";        
        }
    }
}

class ConversationCreate extends WebhookEvent {
    constructor(req) {
        super(req);
        this.userId = this.payload.user?.id;
        this.userExternalId = this.payload.user?.externalId;
        this.creationReason = this.payload.creationReason;
        this.sourceType = this.payload.source.type;
        this.sourceIntegrationId = this.payload.source.integrationId;
    }
    isConversationCreate() {
        return this.eventType === "conversation:create";
    }
    isCreationReasonStartConversation() {
        return this.creationReason === "startConversation";
    }   
}

class ConversationMessage extends WebhookEvent {
    constructor(req) {
        super(req);
        this.messageId = this.message.id;
        this.receivedAt = this.message.received;
        this.authorId = this.message.author.userId;
        this.avatarUrl = this.message.author?.avatarUrl;
        this.displayName = this.message.author?.displayName;
        this.authorType = this.message.author?.type;
        this.userId = this.message.author.user?.id;
        this.userExternalId = this.message.author.user?.externalId;
        this.givenName = this.message.author.user?.profile.givenName;
        this.email = this.message.author.user?.profile.email;
        this.locale = this.message.author.user?.profile.locale;
        this.signedUpAt = this.message.author.user?.signedUpAt;
        this.userMetadata = this.message.author.user?.metadata;
        this.contentType = this.message.content.type;
        this.userMessage = this.message.content.text;
        this.payload = this.message.content.payload;
        this.sourceIntegrationId = this.message.source.integrationId;
        this.sourceType = this.message.source.type;
    }
    isConversationMessage() {
        return this.eventType === "conversation:message";
    }
    isBusinessMessage() {
        return this.authorType === "business";
    }
    isTextMessage() {
        return this.contentType === "text";
    }
}

module.exports = {
    ConversationCreate,
    ConversationMessage
};
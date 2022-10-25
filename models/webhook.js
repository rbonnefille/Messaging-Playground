require('dotenv').config();

class WebhookEvent {
    constructor(req) {
        this._webhookEventApiKey = req.headers["x-api-key"];
        this._appId = req.body.app.id;
        this.webhookId = req.body.webhook.id;
        this.webhookVersion = req.body.webhook.version;
        this.eventId = req.body.events[0].id;
        this.eventCreatedAt = req.body.events[0].createdAt;
        this.eventType = req.body.events[0].type;
        this.messageType = req.body.events[0].payload.message?.source?.type || req.body.events[0].payload.source?.type || req.body.events[0].payload.activity?.source?.type;
        this.conversationId = req.body.events[0].payload.conversation.id;
        this.conversationType = req.body.events[0].payload.conversation.type;
        this.activeSwitchboardIntegrationId = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = req.body.events[0].payload.conversation.activeSwitchboardIntegration?.integrationType;        
    }

    get webhookEventApiKey() {
        return this._webhookEventApiKey;
    }

    set webhookEventApiKey(value) {
        throw new Error(`WebhookEventApiKey is read-only. ${value} is ignored.`);
    }

    get appId() {
        return this._appId;
    }

    set appId(value) {
        throw new Error(`AppId is read-only. ${value} is ignored.`);
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
                return this.messageType !== "api:conversations";
            case "conversation:create":
                return this.messageType === "android" || this.messageType === "ios" || this.messageType === "web";        
        }
    }
}

class ConversationCreate extends WebhookEvent {
    constructor(req) {
        super(req);
        if (this.isConversationCreate()) {
            this.userId = req.body.events[0].payload.user?.id;
            this.userExternalId = req.body.events[0].payload.user?.externalId;
            this.creationReason = req.body.events[0].payload.creationReason;
            this.sourceType = req.body.events[0].payload.source.type;
            this.sourceIntegrationId = req.body.events[0].payload.source.integrationId;
        }
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
        if(this.isConversationMessage()){
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
            this._userMessage = req.body.events[0].payload.message.content.text?.toLowerCase().trim() || req.body.events[0].payload.message.content.payload?.toLowerCase().trim();
            this.sourceIntegrationId = req.body.events[0].payload.message.source.integrationId;
            this.sourceType = req.body.events[0].payload.message.source.type;
        }
    }
    get userMessage(){
        return this._userMessage;
    }
    set userMessage(message){
        throw new Error(`User message is read only; ${message} will be ignored`);
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
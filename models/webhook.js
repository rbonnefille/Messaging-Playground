require('dotenv').config();

class WebhookEvent {
    constructor(req) {
        const {
            events: [event],
        } = req.body;
        this._webhookEventApiKey = req.headers["x-api-key"];
        this._appId = req.body.app.id;
        this.webhookId = req.body.webhook.id;
        this.webhookVersion = req.body.webhook.version;
        if(req.body.events.length > 1){
            console.log(req.body);
            throw new Error(`WebhookEvent only supports one event at the moment. ${req.body.events} events are ignored.`);
        }
        this.eventId = event.id;
        this.eventCreatedAt = event.createdAt;
        this.eventType = event.type;
        this.messageType = event.payload.message?.source?.type || event.payload?.source?.type || event.payload?.activity?.source?.type || event.payload?.source?.type;
        this.conversationId = event.payload?.conversation?.id;
        this.conversationType = event.payload?.conversation?.type;
        this.activeSwitchboardIntegrationId = event.payload.conversation.activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName = event.payload.conversation.activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId = event.payload.conversation.activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = event.payload.conversation.activeSwitchboardIntegration?.integrationType;        
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
            case "conversation:postback":
                return this.messageType !== "api:conversations";
            case "conversation:create":
                return this.messageType === "android" || this.messageType === "ios";        
        }
    }
}

class ConversationCreate extends WebhookEvent {
    constructor(req) {
        super(req);
        const {
            events: [event],
        } = req.body;
        if (this.isConversationCreate()) {
            this.userId = event.payload.user?.id;
            this.userExternalId = event.payload.user?.externalId;
            this.creationReason = event.payload.creationReason;
            this.sourceType = event.payload.source.type;
            this.sourceIntegrationId = event.payload.source.integrationId;
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
            const {
                events: [event],
            } = req.body;
            this.messageId = event.payload.message?.id;
            this.receivedAt = event.payload.message?.received;
            this.authorId = event.payload.message?.author.userId;
            this.avatarUrl = event.payload.message?.author?.avatarUrl;
            this.displayName = event.payload.message?.author?.displayName;
            this.authorType = event.payload.message?.author?.type || "user";
            this.userId = event.payload.message?.author.user?.id;
            this.userExternalId = event.payload.message?.author.user?.externalId;
            this.givenName = event.payload.message?.author.user?.profile.givenName;
            this.email = event.payload.message?.author.user?.profile.email;
            this.locale = event.payload.message?.author.user?.profile.locale;
            this.signedUpAt = event.payload.message?.author.user?.signedUpAt;
            this.userMetadata = event.payload.message?.author.user?.metadata;
            this.contentType = event.payload.message?.content.type || "text";
            this._userMessage = event.payload.message?.content?.payload || event.payload.message?.content?.text || event.payload.postback?.payload;
            this.sourceIntegrationId = event.payload.message?.source.integrationId;
            this.sourceType = event.payload.message?.source.type || event.payload.source?.type;
            this.recentNotifications = event.payload?.recentNotifications;
    }
    get userMessage(){
        return this._userMessage.toLowerCase().trim();    
    }
    set userMessage(message){
        throw new Error(`User message is read only; ${message} will be ignored`);
    }
    isConversationMessage() {
        return this.eventType === "conversation:message" || this.eventType === "conversation:postback";
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
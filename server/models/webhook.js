import * as dotenv from 'dotenv'
dotenv.config()

class WebhookEvent {
    constructor(req) {
        const {
            events: [event],
        } = req.body;
        const { payload } = event;
        const { conversation } = payload;
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
        this.sourceType = payload.message?.source?.type ?? payload.source?.type ?? payload.activity?.source?.type ?? payload.source?.type;
        this.conversationId = conversation.id;
        this.conversationType = conversation.type;
        this.activeSwitchboardIntegrationId = conversation.activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName = conversation.activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId = conversation.activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType = conversation.activeSwitchboardIntegration?.integrationType;        
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
}

class ConversationEvent extends WebhookEvent {
    constructor(req) {
        super(req);
        const {
            events: [event],
        } = req.body;
        const { payload } = event;
        if (this.isConversationCreate()) {
            this.userId = payload.user?.id;
            this.userExternalId = payload.user?.externalId;
            this.creationReason = payload.creationReason;
            this.sourceType = payload.source?.type;
            this.sourceIntegrationId = payload.source?.integrationId;
        } 
        if (this.isConversationMessage()) {
            this.messageId = payload.message?.id;
            this.receivedAt = payload.message?.received;
            this.authorId = payload.message?.author?.userId;
            this.avatarUrl = payload.message?.author?.avatarUrl;
            this.displayName = payload.message?.author?.displayName;
            this.authorType = payload.message?.author?.type ?? "user";
            this.userId = payload.message?.author.user?.id;
            this.userExternalId = payload.message?.author.user?.externalId;
            this.givenName = payload.message?.author.user?.profile?.givenName;
            this.email = payload.message?.author.user?.profile?.email;
            this.locale = payload.message?.author.user?.profile?.locale;
            this.signedUpAt = payload.message?.author.user?.signedUpAt;
            this.userMetadata = payload.message?.author.user?.metadata;
            this.contentType = payload.message?.content?.type ?? "text";
            this.textFallback = payload.message?.content?.textFallback;
            this._userMessage = payload.message?.content?.payload ?? payload.message?.content?.text ?? payload.postback?.payload;
            this.sourceIntegrationId = payload.message?.source?.integrationId;
            this.sourceType = payload.message?.source?.type ?? payload.source?.type;
            this.recentNotifications = payload.recentNotifications;
        }
        if (this.isConversationRead()) {
            this.userExternalId = payload.activity?.author?.user?.externalId;
            this.userId = payload.activity?.author?.userId
        }
    }
    isConversationCreate() {
        return this.eventType === "conversation:create";
    }
    isCreationReasonStartConversation() {
        return this.creationReason === "startConversation";
    }
    isConversationRead() {
        return this.eventType === "conversation:read";
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
    ifFormMessage() {
        return this.contentType === "formResponse";
    }
    isAllowedChannel(){
        if (this.isConversationMessage()) {
            return this.sourceType !== "api:conversations";
        } else if (this.isConversationCreate()) {
            return this.sourceType === "android" || this.sourceType === "ios" || this.sourceType === "web";
        }
    }
    get userMessage(){
        return this._userMessage.toLowerCase().trim() || this._userMessage;    
    }
    set userMessage(message){
        return this._userMessage = message;
    }
}

export default ConversationEvent;
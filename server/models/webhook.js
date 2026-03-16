import * as dotenv from 'dotenv';
dotenv.config();

const EVENT_TYPES = {
    CONVERSATION_CREATE: 'conversation:create',
    CONVERSATION_MESSAGE: 'conversation:message',
    CONVERSATION_POSTBACK: 'conversation:postback',
    CONVERSATION_READ: 'conversation:read',
};

const {
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegrationId,
    WEBHOOK_SUNCO: webhookSunco,
} = process.env;

class WebhookEvent {
    constructor(req) {
        this._initializeWebhookEvent(req);
        this._validateSingleEvent(req);
        this._extractEventDetails(req);
    }

    _initializeWebhookEvent(req) {
        this._webhookEventApiKey = req.headers['x-api-key'];
        this._appId = req.body.app.id;
        this.webhookId = req.body.webhook.id;
        this.webhookVersion = req.body.webhook.version;
    }

    _validateSingleEvent(req) {
        if (req.body.events.length > 1) {
            console.log(req.body);
            throw new Error(
                `WebhookEvent only supports one event at the moment. ${req.body.events.length} events are ignored.`
            );
        }
    }

    _extractEventDetails(req) {
        const {
            events: [event],
        } = req.body;
        const { payload } = event;
        const {
            conversation: { id, type, activeSwitchboardIntegration } = {},
        } = payload;

        this.eventId = event.id;
        this.eventCreatedAt = event.createdAt;
        this.eventType = event.type;
        this.sourceType =
            payload.message?.source?.type ??
            payload.source?.type ??
            payload.activity?.source?.type ??
            payload.source?.type;
        this.conversationId = id;
        this.conversationType = type;
        this.activeSwitchboardIntegrationId = activeSwitchboardIntegration?.id;
        this.activeSwitchboardIntegrationName =
            activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId =
            activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType =
            activeSwitchboardIntegration?.integrationType;
    }

    get webhookEventApiKey() {
        return this._webhookEventApiKey;
    }
    set webhookEventApiKey(value) {
        throw new Error(
            `WebhookEventApiKey is read-only. ${value} is ignored.`
        );
    }
    get appId() {
        return this._appId;
    }
    set appId(value) {
        throw new Error(`AppId is read-only. ${value} is ignored.`);
    }
    isAuthenticatedRequest(webhookSecret) {
        return webhookSecret === webhookSunco;
    }
    isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
        return activeSwitchboardIntegration === botSwitchboardIntegrationId;
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
            this._extractConversationCreateDetails(payload);
        } else if (this.isConversationMessage()) {
            this._extractConversationMessageDetails(payload);
        } else if (this.isConversationPostback()) {
            this._extractConversationPostbackDetails(payload);
        } else if (this.isConversationRead()) {
            this._extractConversationReadDetails(payload);
        }
    }
    _extractConversationCreateDetails(payload) {
        this.userId = payload.user?.id;
        this.userExternalId = payload.user?.externalId;
        this.creationReason = payload.creationReason;
        this.sourceType = payload.source?.type;
        this.sourceDevice = payload.source?.device;
        this.integrationId = payload.source?.integrationId;
    }

    _extractConversationMessageDetails(payload) {
        this.message = payload.message || {};
        this.author = this.message.author || {};
        this.user = this.author.user || {};
        this.profile = this.user.profile || {};
        this.content = this.message.content || {};
        this.source = this.message.source || {};
        this.messageId = this.message.id;
        this.receivedAt = this.message.received;
        this.authorId = this.user.id;
        this.avatarUrl = this.profile.avatarUrl;
        this.displayName = this.profile.displayName;
        this.authorType = this.author.type;
        this.userId = this.user.id;
        this.userExternalId = this.user.externalId;
        this.givenName = this.profile.givenName;
        this.surname = this.profile.surname;
        this.email = this.profile.email;
        this.locale = this.profile.locale;
        this.signedUpAt = this.profile.signedUpAt;
        this.userMetadata = this.profile.metadata;
        this.contentType = this.content?.type ?? 'text';
        this.textFallback = this.content?.textFallback;
        this._userMessage =
            this.content?.payload ?? this.content?.text ?? this.textFallback;
        this.integrationId = this.source?.integrationId;
        this.sourceType = this.source?.type;
        this.sourceDevice = this.source?.device;
        this.recentNotifications = payload.recentNotifications;
    }

    _extractConversationPostbackDetails(payload) {
        this.userId = payload.user?.id;
        this.userExternalId = payload.user?.externalId;
        this.contentType = 'text';
        this._userMessage = payload.postback?.payload;
        this.sourceType = payload.source?.type;
        this.integrationId = payload.source?.integrationId;
        this.sourceDevice = payload.source?.device;
    }

    _extractConversationReadDetails(payload) {
        this.userExternalId = payload.activity?.author?.user?.externalId;
        this.userId = payload.activity?.author?.userId;
        this.sourceDevice = payload.activity?.source?.device;
    }

    isConversationCreate() {
        return this.eventType === EVENT_TYPES.CONVERSATION_CREATE;
    }
    isCreationReasonStartConversation() {
        return this.creationReason === 'startConversation';
    }
    isConversationRead() {
        return this.eventType === EVENT_TYPES.CONVERSATION_READ;
    }
    isConversationMessage() {
        return this.eventType === EVENT_TYPES.CONVERSATION_MESSAGE;
    }
    isConversationPostback() {
        return this.eventType === EVENT_TYPES.CONVERSATION_POSTBACK;
    }
    isBusinessMessage() {
        return this.authorType === 'business';
    }
    isTextMessage() {
        return this.contentType === 'text';
    }
    ifFormMessage() {
        return this.contentType === 'formResponse';
    }
    isAllowedChannel() {
        if (this.isConversationMessage() || this.isConversationPostback()) {
            return this.sourceType !== 'api:conversations';
        } else if (this.isConversationCreate()) {
            return (
                this.sourceType === 'android' ||
                this.sourceType === 'ios' ||
                this.sourceType === 'web' ||
                this.sourceType === 'messenger'
            );
        }
    }
    isSocialChannel() {
        const sources = [
            'whatsapp',
            'telegram',
            'messenger',
            'line',
            'viber',
            'gbm',
            'wechat',
        ];
        return sources.includes(this.sourceType);
    }
    get userMessage() {
        return this._userMessage
            ? this._userMessage.toLowerCase().trim()
            : undefined;
    }
    set userMessage(message) {
        return (this._userMessage = message);
    }
}

export default ConversationEvent;

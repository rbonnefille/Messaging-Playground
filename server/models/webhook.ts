import type { Request } from 'express';

const EVENT_TYPES = {
    CONVERSATION_CREATE: 'conversation:create',
    CONVERSATION_MESSAGE: 'conversation:message',
    CONVERSATION_POSTBACK: 'conversation:postback',
    CONVERSATION_READ: 'conversation:read',
} as const;

const {
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegrationId,
    CONVERSATION_INTEGRATION_SHARED_SECRET: webhookXapiKey,
} = process.env;

interface SwitchboardIntegration {
    id?: string;
    name?: string;
    integrationId?: string;
    integrationType?: string;
}

interface ConversationRef {
    id?: string;
    type?: string;
    activeSwitchboardIntegration?: SwitchboardIntegration;
}

interface Source {
    type?: string;
    device?: string;
    integrationId?: string;
}

interface UserProfile {
    avatarUrl?: string;
    displayName?: string;
    givenName?: string;
    surname?: string;
    email?: string;
    locale?: string;
    signedUpAt?: string;
    metadata?: Record<string, unknown>;
}

interface UserRef {
    id?: string;
    externalId?: string;
    profile?: UserProfile;
}

interface Author {
    type?: string;
    user?: UserRef;
}

interface MessageContent {
    type?: string;
    text?: string;
    textFallback?: string;
    payload?: string;
}

interface Message {
    id?: string;
    received?: string;
    author?: Author;
    content?: MessageContent;
    source?: Source;
}

interface Postback {
    payload?: string;
}

interface Activity {
    author?: {
        user?: UserRef;
        userId?: string;
    };
    source?: Source;
}

type RecentNotification = Record<string, unknown>;

interface ConversationCreatePayload {
    user?: UserRef;
    creationReason?: string;
    source?: Source;
}

interface ConversationMessagePayload {
    message?: Message;
    recentNotifications?: RecentNotification[];
}

interface ConversationPostbackPayload {
    user?: UserRef;
    postback?: Postback;
    source?: Source;
}

interface ConversationReadPayload {
    activity?: Activity;
}

type WebhookEventEnvelope =
    | {
        id: string;
        createdAt: string;
        type: typeof EVENT_TYPES.CONVERSATION_CREATE;
        payload: ConversationCreatePayload;
    }
    | {
        id: string;
        createdAt: string;
        type: typeof EVENT_TYPES.CONVERSATION_MESSAGE;
        payload: ConversationMessagePayload;
    }
    | {
        id: string;
        createdAt: string;
        type: typeof EVENT_TYPES.CONVERSATION_POSTBACK;
        payload: ConversationPostbackPayload;
    }
    | {
        id: string;
        createdAt: string;
        type: typeof EVENT_TYPES.CONVERSATION_READ;
        payload: ConversationReadPayload;
    };

interface WebhookEnvelope {
    app: { id: string };
    webhook: { id: string; version: string };
    events: WebhookEventEnvelope[];
}

type WebhookRequest = Request<Request['params'], unknown, WebhookEnvelope>;

interface EventDetailsPayload {
    conversation?: ConversationRef;
    message?: Message;
    source?: Source;
    activity?: Activity;
}

class WebhookEvent {
    protected _webhookEventApiKey!: string | undefined;
    private _appId!: string | undefined;
    webhookId!: string | undefined;
    webhookVersion!: string | undefined;
    eventId!: string | undefined;
    eventCreatedAt!: string | undefined;
    eventType!: string;
    sourceType!: string | undefined;
    conversationId!: string | undefined;
    conversationType!: string | undefined;
    activeSwitchboardIntegrationId!: string | undefined;
    activeSwitchboardIntegrationName!: string | undefined;
    activeSwitchboardIntegrationIntegrationId!: string | undefined;
    activeSwitchboardIntegrationIntegrationType!: string | undefined;

    constructor(req: WebhookRequest) {
        this._initializeWebhookEvent(req);
        this._validateSingleEvent(req);
        this._extractEventDetails(req);
    }

    _initializeWebhookEvent(req: WebhookRequest) {
        this._webhookEventApiKey = req.headers['x-api-key'] as string | undefined;
        this._appId = req.body.app.id;
        this.webhookId = req.body.webhook.id;
        this.webhookVersion = req.body.webhook.version;
    }

    _validateSingleEvent(req: WebhookRequest) {
        if (req.body.events.length > 1) {
            console.log(req.body);
            throw new Error(
                `WebhookEvent only supports one event at the moment. ${req.body.events.length} events are ignored.`
            );
        }
    }

    _extractEventDetails(req: WebhookRequest) {
        const {
            events: [event],
        } = req.body;
        const payload: EventDetailsPayload = event.payload;
        const conversation = payload.conversation ?? ({} as ConversationRef);
        const { id, type, activeSwitchboardIntegration } = conversation;

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
        this.activeSwitchboardIntegrationName = activeSwitchboardIntegration?.name;
        this.activeSwitchboardIntegrationIntegrationId =
            activeSwitchboardIntegration?.integrationId;
        this.activeSwitchboardIntegrationIntegrationType =
            activeSwitchboardIntegration?.integrationType;
    }

    get webhookEventApiKey(): string | undefined {
        return this._webhookEventApiKey;
    }
    set webhookEventApiKey(value: string | undefined) {
        throw new Error(`WebhookEventApiKey is read-only. ${value} is ignored.`);
    }
    get appId(): string | undefined {
        return this._appId;
    }
    set appId(value: string | undefined) {
        throw new Error(`AppId is read-only. ${value} is ignored.`);
    }
    isAuthenticatedRequest(webhookSecret: string | undefined): boolean {
        return webhookSecret === webhookXapiKey;
    }
    isCurrentSwitchboardIntegration(
        activeSwitchboardIntegration: string | undefined
    ): boolean {
        return activeSwitchboardIntegration === botSwitchboardIntegrationId;
    }
}

class ConversationEvent extends WebhookEvent {
    userId!: string | undefined;
    userExternalId!: string | undefined;
    creationReason!: string | undefined;
    sourceDevice!: string | undefined;
    integrationId!: string | undefined;
    message!: Message;
    author!: Author;
    user!: UserRef;
    profile!: UserProfile;
    content!: MessageContent;
    source!: Source;
    messageId!: string | undefined;
    receivedAt!: string | undefined;
    authorId!: string | undefined;
    avatarUrl!: string | undefined;
    displayName!: string | undefined;
    authorType!: string | undefined;
    givenName!: string | undefined;
    surname!: string | undefined;
    email!: string | undefined;
    locale!: string | undefined;
    signedUpAt!: string | undefined;
    userMetadata!: Record<string, unknown> | undefined;
    contentType!: string | undefined;
    textFallback!: string | undefined;
    recentNotifications!: RecentNotification[] | undefined;
    protected _userMessage!: string | undefined;

    constructor(req: WebhookRequest) {
        super(req);
        const event = req.body.events[0];

        if (event.type === EVENT_TYPES.CONVERSATION_CREATE) {
            this._extractConversationCreateDetails(event.payload);
        } else if (event.type === EVENT_TYPES.CONVERSATION_MESSAGE) {
            this._extractConversationMessageDetails(event.payload);
        } else if (event.type === EVENT_TYPES.CONVERSATION_POSTBACK) {
            this._extractConversationPostbackDetails(event.payload);
        } else if (event.type === EVENT_TYPES.CONVERSATION_READ) {
            this._extractConversationReadDetails(event.payload);
        }
    }

    _extractConversationCreateDetails(payload: ConversationCreatePayload) {
        this.userId = payload.user?.id;
        this.userExternalId = payload.user?.externalId;
        this.creationReason = payload.creationReason;
        this.sourceType = payload.source?.type;
        this.sourceDevice = payload.source?.device;
        this.integrationId = payload.source?.integrationId;
    }

    _extractConversationMessageDetails(payload: ConversationMessagePayload) {
        this.message = payload.message ?? ({} as Message);
        this.author = this.message.author ?? ({} as Author);
        this.user = this.author.user ?? ({} as UserRef);
        this.profile = this.user.profile ?? ({} as UserProfile);
        this.content = this.message.content ?? ({} as MessageContent);
        this.source = this.message.source ?? ({} as Source);
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

    _extractConversationPostbackDetails(payload: ConversationPostbackPayload) {
        this.userId = payload.user?.id;
        this.userExternalId = payload.user?.externalId;
        this.contentType = 'text';
        this._userMessage = payload.postback?.payload;
        this.sourceType = payload.source?.type;
        this.integrationId = payload.source?.integrationId;
        this.sourceDevice = payload.source?.device;
    }

    _extractConversationReadDetails(payload: ConversationReadPayload) {
        this.userExternalId = payload.activity?.author?.user?.externalId;
        this.userId = payload.activity?.author?.userId;
        this.sourceDevice = payload.activity?.source?.device;
    }

    isConversationCreate(): boolean {
        return this.eventType === EVENT_TYPES.CONVERSATION_CREATE;
    }
    isCreationReasonStartConversation(): boolean {
        return this.creationReason === 'startConversation' || this.creationReason === 'none';
    }
    isConversationRead(): boolean {
        return this.eventType === EVENT_TYPES.CONVERSATION_READ;
    }
    isConversationMessage(): boolean {
        return this.eventType === EVENT_TYPES.CONVERSATION_MESSAGE;
    }
    isConversationPostback(): boolean {
        return this.eventType === EVENT_TYPES.CONVERSATION_POSTBACK;
    }
    isBusinessMessage(): boolean {
        return this.authorType === 'business';
    }
    isTextMessage(): boolean {
        return this.contentType === 'text';
    }
    isAttachmentMessage(): boolean {
        return this.contentType === 'file' || this.contentType === 'image';
    }
    ifFormMessage(): boolean {
        return this.contentType === 'formResponse';
    }
    isAllowedChannel(): boolean | undefined {
        if (this.isConversationMessage() || this.isConversationPostback()) {
            return this.sourceType !== 'api:conversations';
        } else if (this.isConversationCreate()) {
            return (
                this.sourceType === 'android' ||
                this.sourceType === 'ios' ||
                this.sourceType === 'web' ||
                this.sourceType === 'messenger' ||
                this.sourceType === 'api'
            );
        }
    }
    isSocialChannel(): boolean {
        const sources = [
            'whatsapp',
            'telegram',
            'messenger',
            'line',
            'viber',
            'gbm',
            'wechat',
        ];
        return this.sourceType != null && sources.includes(this.sourceType);
    }
    get userMessage(): string | undefined {
        return this._userMessage
            ? this._userMessage.toLowerCase().trim()
            : undefined;
    }
    set userMessage(message: string | undefined) {
        this._userMessage = message;
    }
}

export default ConversationEvent;

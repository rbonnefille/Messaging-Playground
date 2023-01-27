import * as dotenv from "dotenv";
dotenv.config();

class WebhookEvent {
  constructor(req) {
    const {
      events: [event],
    } = req.body;
    const { payload } = event;
    const { conversation: { id, type, activeSwitchboardIntegration } = {} } = payload;
    this._webhookEventApiKey = req.headers["x-api-key"];
    this._appId = req.body.app.id;
    this.webhookId = req.body.webhook.id;
    this.webhookVersion = req.body.webhook.version;
    if (req.body.events.length > 1) {
      console.log(req.body);
      throw new Error(
        `WebhookEvent only supports one event at the moment. ${req.body.events} events are ignored.`
      );
    }
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
    this.activeSwitchboardIntegrationId =
      activeSwitchboardIntegration?.id;
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
  isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
    return (
      activeSwitchboardIntegration ===
      process.env.BOT_SWITCHBOARD_INTEGRATION_ID
    );
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
      const {
        message: {
          id: messageId,
          received,
          author: {
            userId = {},
            avatarUrl,
            displayName,
            type,
            user: {
              id: userObjectId,
              externalId,
              profile = {},
              signedUpAt,
              metadata,
            } = {},
          } = {},
          content,
          source,
        } = {},
      } = payload;
      this.messageId = messageId;
      this.receivedAt = received;
      this.authorId = userId;
      this.avatarUrl = avatarUrl;
      this.displayName = displayName;
      this.authorType = type ?? "user";
      this.userId = userObjectId;
      this.userExternalId = externalId;
      this.givenName = profile.givenName;
      this.email = profile.email;
      this.locale = profile.locale;
      this.signedUpAt = signedUpAt;
      this.userMetadata = metadata;
      this.contentType = content?.type ?? "text";
      this.textFallback = content?.textFallback;
      this._userMessage =
        content?.payload ?? content?.text;
      this.sourceIntegrationId = source?.integrationId;
      this.sourceType = source?.type;
      this.recentNotifications = payload.recentNotifications;
    }
    if (this.isConversationPostback()) {
      this.userId = payload.user?.id;
      this.userExternalId = payload.user?.externalId;
      this.contentType = "text";
      this._userMessage = payload.postback?.payload;
      this.sourceType = payload.source?.type;
      this.sourceIntegrationId = payload.source?.integrationId;
      this.sourceType = payload.source?.type;
    }
    if (this.isConversationRead()) {
      this.userExternalId = payload.activity?.author?.user?.externalId;
      this.userId = payload.activity?.author?.userId;
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
    return (
      this.eventType === "conversation:message"
    );
  }
  isConversationPostback() {
    return (
      this.eventType === "conversation:postback"
    );
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
  isAllowedChannel() {
    if (this.isConversationMessage() || this.isConversationPostback()) {
      return this.sourceType !== "api:conversations";
    } else if (this.isConversationCreate()) {
      return (
        this.sourceType === "android" ||
        this.sourceType === "ios" ||
        this.sourceType === "web"
      );
    }
  }
  get userMessage() {
    return this._userMessage.toLowerCase().trim() || this._userMessage;
  }
  set userMessage(message) {
    return (this._userMessage = message);
  }
}

export default ConversationEvent;

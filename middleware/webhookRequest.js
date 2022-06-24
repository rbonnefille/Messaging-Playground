require('dotenv').config();

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration
  } = process.env;

class WebhookRequest {
    constructor(req) {
        this.webhookConversationsSecret = webhookConversationsSecret;
        this.botSwitchboardIntegration = botSwitchboardIntegration;
        this.webhookEventApiKey = req.headers["x-api-key"];
        this.messageEvent = req.body.events[0];
        this.messageEventType = this.messageEvent.type;
        this.payload = this.messageEvent.payload;
        this.conversation = this.payload.conversation;
        this.message = this.payload.message || {};
        this.author = this.message?.author || {};
        this.authorType = this.author.type || {};        
        this.content = this.message?.content || {};
        this.contentType = this.content.type || {};
        this.source = this.message?.source;
        this.conversationId = this.conversation.id;
        this.activeSwitchboardIntegration = this.conversation?.activeSwitchboardIntegration?.id || {};
        this.userMessage = this.content?.text?.toLowerCase();
        this.switchBoardMetadata = {
            givenName: this.author?.user?.profile?.givenName,
            email: this.author?.user?.profile?.email,
            externalId: this.author?.user?.externalId,
            eventSource: this.source?.type,
            conversation: this.conversationId
        };
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
    isConversationCreate(messageEventType) {
        return messageEventType === "conversation:create";
    }
    isTextMessage(contentType) {
        return contentType === "text";
    }
}

module.exports = WebhookRequest;
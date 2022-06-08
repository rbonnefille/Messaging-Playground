class WebhookRequest {
    constructor(req) {
        this.webhookEventApiKey = req.headers["x-api-key"];
        this.messageEvent = req.body.events[0];
        this.payload = this.messageEvent.payload;
        this.conversation = this.payload.conversation;
        this.message = this.payload.message;
        this.author = this.message.author;
        this.content = this.message.content;
        this.source = this.message.source;
        this.conversationId = this.conversation.id;
        this.activeSwitchboardIntegration = this.conversation?.activeSwitchboardIntegration?.id || {};
        this.userMessage = this.content?.text?.toLowerCase();
        this.switchBoardMetadata = {
            givenName: this.author.user?.profile?.givenName,
            email: this.author.user?.profile?.email,
            externalId: this.author.user?.externalId,
            eventSource: this.source.type,
            conversation: this.conversationId
        };
    }
}

module.exports = WebhookRequest;
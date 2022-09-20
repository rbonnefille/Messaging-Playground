class PassControlMetadata {
    constructor(webhookEvent) {
        this.givenName = webhookEvent.displayName;
        this.email = webhookEvent.email;
        this.externalId = webhookEvent.userExternalId;
        this.eventSource = webhookEvent.sourceType;
        this.conversation = webhookEvent.conversationId;
    }
}

module.exports = PassControlMetadata;
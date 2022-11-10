class PassControlMetadata {
    constructor(webhookEvent) {
        this._givenName = webhookEvent.displayName;
        this._email = webhookEvent.email;
        this._externalId = webhookEvent.userExternalId;
        this._eventSource = webhookEvent.sourceType;
        this._conversation = webhookEvent.conversationId;
        this._recentNotifications = webhookEvent.recentNotifications;
    }
    get givenName() {
        return this._givenName;
    }
    get email() {
        return this._email;
    }
    get externalId() {
        return this._externalId;
    }
    get eventSource() {
        return this._eventSource;
    }
    get conversation() {
        return this._conversation;
    }
    set givenName(value) {
        throw new Error(`GivenName is read-only. ${value} is ignored.`);
    }
    set email(value) {
        throw new Error(`Email is read-only. ${value} is ignored.`);
    }
    set externalId(value) {
        throw new Error(`ExternalId is read-only. ${value} is ignored.`);
    }
    set eventSource(value) {
        throw new Error(`EventSource is read-only. ${value} is ignored.`);
    }
    set conversation(value) {
        throw new Error(`Conversation is read-only. ${value} is ignored.`);
    }
    get recentNotifications() {
        return this._recentNotifications;
    }
    set recentNotifications(value) {
        throw new Error(`RecentNotifications is read-only. ${value} is ignored.`);
    }
}

module.exports = PassControlMetadata;
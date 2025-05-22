export default class PassControlMetadata {
    constructor(webhookEvent) {
        this._displayName = webhookEvent.displayName;
        this._email = webhookEvent.email;
        this._userExternalId = webhookEvent.userExternalId;
        this._eventSource = webhookEvent.sourceType;
        this._conversation = webhookEvent.conversationId;
        this._recentNotifications = webhookEvent.recentNotifications;
    }
    get displayName() {
        return this._displayName;
    }
    get email() {
        return this._email;
    }
    get userExternalId() {
        return this._userExternalId;
    }
    get eventSource() {
        return this._eventSource;
    }
    get conversation() {
        return this._conversation;
    }
    set displayName(value) {
        throw new Error(`displayName is read-only. ${value} is ignored.`);
    }
    set email(value) {
        throw new Error(`Email is read-only. ${value} is ignored.`);
    }
    set userExternalId(value) {
        throw new Error(`ExternalId is read-only. ${value} is ignored.`);
    }
    set eventSource(value) {
        throw new Error(`EventSource is read-only. ${value} is ignored.`);
    }
    set conversation(value) {
        throw new Error(`Conversation is read-only. ${value} is ignored.`);
    }
    get recentNotifications() {
        return Array.isArray(this._recentNotifications);
    }
    set recentNotifications(value) {
        throw new Error(
            `RecentNotifications is read-only. ${value} is ignored.`
        );
    }
}

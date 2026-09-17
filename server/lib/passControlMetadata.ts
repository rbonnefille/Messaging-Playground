import type ConversationEvent from './webhook'

export default class PassControlMetadata {
  private _displayName!: string | undefined
  private _email!: string | undefined
  private _userExternalId!: string | undefined
  private _eventSource!: string | undefined
  private _conversation!: string | undefined
  private _recentNotifications!: unknown[] | undefined

  constructor(webhookEvent: ConversationEvent) {
    this._displayName = webhookEvent.displayName
    this._email = webhookEvent.email
    this._userExternalId = webhookEvent.userExternalId
    this._eventSource = webhookEvent.sourceType
    this._conversation = webhookEvent.conversationId
    this._recentNotifications = webhookEvent.recentNotifications
  }
  get displayName(): string | undefined {
    return this._displayName
  }
  get email(): string | undefined {
    return this._email
  }
  get userExternalId(): string | undefined {
    return this._userExternalId
  }
  get eventSource(): string | undefined {
    return this._eventSource
  }
  get conversation(): string | undefined {
    return this._conversation
  }
  set displayName(value: string | undefined) {
    throw new Error(`displayName is read-only. ${value} is ignored.`)
  }
  set email(value: string | undefined) {
    throw new Error(`Email is read-only. ${value} is ignored.`)
  }
  set userExternalId(value: string | undefined) {
    throw new Error(`ExternalId is read-only. ${value} is ignored.`)
  }
  set eventSource(value: string | undefined) {
    throw new Error(`EventSource is read-only. ${value} is ignored.`)
  }
  set conversation(value: string | undefined) {
    throw new Error(`Conversation is read-only. ${value} is ignored.`)
  }
  get recentNotifications(): boolean {
    return Array.isArray(this._recentNotifications)
  }
  set recentNotifications(value: boolean) {
    throw new Error(`RecentNotifications is read-only. ${value} is ignored.`)
  }
}

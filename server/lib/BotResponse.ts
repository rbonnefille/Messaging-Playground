interface BotAuthor {
  type: 'business'
  subtypes: string[]
  displayName: string
  avatarUrl: string | undefined
}

export interface BotResponsePayload {
  conversationId: string | undefined
  author: BotAuthor
  message: string | undefined
  image: string | undefined
  metadata: Record<string, unknown> | undefined
}

export default class BotResponse {
  conversationId: string | undefined
  author: BotAuthor
  message: string | undefined
  image: string | undefined
  metadata: Record<string, unknown> | undefined

  constructor(conversationId: string | undefined) {
    const { botName, botAvatarUrl, defaultBotAvatarUrl } = useRuntimeConfig()
    this.conversationId = conversationId
    this.author = {
      type: 'business',
      subtypes: ['AI'],
      displayName: botName || 'Bugs Bunny',
      avatarUrl: botAvatarUrl || defaultBotAvatarUrl,
    }
    this.message = undefined
    this.image = undefined
    this.metadata = undefined
  }

  setMessage(message: string): this {
    this.message = message
    return this
  }

  setImage(imageUrl: string): this {
    this.image = imageUrl
    return this
  }

  setMetadata(metadata: Record<string, unknown>): this {
    this.metadata = metadata
    return this
  }

  toPayload(): BotResponsePayload {
    return {
      conversationId: this.conversationId,
      author: this.author,
      message: this.message,
      image: this.image,
      metadata: this.metadata,
    }
  }
}

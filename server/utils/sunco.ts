/**
 * SunCo API client — direct REST via `$fetch` (ofetch).
 *
 * Replaces the `sunshine-conversations-client` SDK, which was built around a
 * global `ApiClient.instance` singleton: every `new SunCoClient()` mutated
 * that shared client, and `passControl` flipped it to basic auth mid-flight —
 * a race condition under concurrent requests. This version issues isolated
 * HTTP calls with per-request auth headers, so there is no shared state.
 *
 * REST reference (v2):
 *   /v2/apps/{appId}/users[/{userIdOrExternalId}][/clients|/devices]
 *   /v2/apps/{appId}/conversations[/{conversationId}][/messages|/participants|/{action}Control]
 *   /v2/apps/{appId}/switchboards[/{switchboardId}][/switchboardIntegrations[/{id}]]
 *   /v2/apps/{appId}/integrations[/{integrationId}]
 *   /v2/apps/{appId}/attachments
 *   /v2/apps/{appId}/conversations/{conversationId}/activity
 */

const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms))

interface UserIdentifierPayload {
  userId?: string
  externalId?: string
}

interface MessagePayload {
  conversationId?: string
  author?: unknown
  message?: string
  image?: string
  metadata?: Record<string, unknown>
}

interface ConversationPayload {
  conversationId?: string
  metadata?: Record<string, unknown>
}

interface SwitchboardIntegrationUpdatePayload {
  switchboardIntegrationId: string
  nextSwitchboardIntegrationId?: string
  deliverStandbyEvents?: boolean
  messageHistoryCount?: number
}

class SunCoClient {
  appId: string
  switchboardId: string
  private suncoJwt: string
  private suncoCustomIntegrationSecret: string
  private podBaseUrl: string
  private nextSwitchboardIntegration: string

  constructor() {
    const config = useRuntimeConfig()
    this.appId = config.appId
    this.switchboardId = config.switchboardId
    this.suncoJwt = config.suncoJwt
    this.suncoCustomIntegrationSecret = config.suncoCustomIntegrationSecret
    this.podBaseUrl = (config.podBaseUrl || config.baseUrl).replace(/\/$/, '')
    this.nextSwitchboardIntegration = config.nextSwitchboardIntegration
  }

  /** Base URL for a v2 app-scoped path. */
  private appUrl(path: string): string {
    return `${this.podBaseUrl}/v2/apps/${this.appId}${path}`
  }

  /**
   * Issue an authenticated request. Mirrors the legacy error contract:
   * on failure, returns the SunCo error title (or status) as a string
   * instead of throwing, so callers behave as before.
   */
  private async request<T = any>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    opts: { body?: unknown; query?: Record<string, unknown>; headers?: Record<string, string> } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.suncoJwt}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    }
    try {
      return await $fetch<T>(url, {
        method,
        headers,
        body: opts.body as any,
        query: opts.query,
      })
    } catch (error: any) {
      // ofetch throws FetchError with .data (parsed body) and .statusCode.
      const title = error?.data?.errors?.[0]?.title
      return (title || error?.statusCode || error?.status) as T
    }
  }

  getUserIdOrExternalId(payload: UserIdentifierPayload | string): any {
    if (typeof payload === 'string') {
      return payload
    }
    if (payload.hasOwnProperty('userId')) {
      return payload.userId
    } else if (payload.hasOwnProperty('externalId')) {
      return payload.externalId
    }
    return payload
  }

  buildMessageContent(
    message: string | undefined,
    image: string | undefined,
    metadata: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    if (image) {
      return { type: 'image', mediaUrl: image, text: message }
    }
    return { type: 'text', text: message, metadata }
  }

  async postActivity(payload: MessagePayload): Promise<any> {
    const { conversationId, author } = payload
    return this.request(
      'POST',
      this.appUrl(`/conversations/${conversationId}/activity`),
      { body: { author, type: 'typing:start' } },
    )
  }

  async sendMessage(payload: MessagePayload): Promise<any> {
    const { conversationId, author, message, image, metadata } = payload
    await this.postActivity(payload)
    await timeout(300)
    return this.request(
      'POST',
      this.appUrl(`/conversations/${conversationId}/messages`),
      { body: { author, content: this.buildMessageContent(message, image, metadata) } },
    )
  }

  async listClients(payload: UserIdentifierPayload | string): Promise<any> {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload)
    return this.request('GET', this.appUrl(`/users/${userIdOrExternalId}/clients`), {
      query: { 'page[size]': 100 },
    })
  }

  async listDevices(payload: UserIdentifierPayload | string): Promise<any> {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload)
    return this.request('GET', this.appUrl(`/users/${userIdOrExternalId}/devices`))
  }

  async getUser(payload: UserIdentifierPayload | string): Promise<any> {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload)
    return this.request('GET', this.appUrl(`/users/${userIdOrExternalId}`))
  }

  async getUserByEmailIdentity(payload: { email: string }): Promise<any> {
    const { email: userEmail } = payload
    return this.request('GET', this.appUrl(`/users`), {
      query: { 'filter[identities.email]': userEmail },
    })
  }

  async listParticipants(conversationId: string): Promise<any> {
    return this.request('GET', this.appUrl(`/conversations/${conversationId}/participants`))
  }

  async updateUser(payload: UserIdentifierPayload | string): Promise<any> {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload)
    return this.request('PATCH', this.appUrl(`/users/${userIdOrExternalId}`), {
      body: { metadata: { botDialog: true } },
    })
  }

  async getConversation(payload: ConversationPayload | string): Promise<any> {
    const conversationId = (payload as any).conversationId || payload
    return this.request('GET', this.appUrl(`/conversations/${conversationId}`))
  }

  async listMessages(payload: ConversationPayload | string): Promise<any> {
    const conversationId = typeof payload === 'string' ? payload : payload.conversationId
    return this.request('GET', this.appUrl(`/conversations/${conversationId}/messages`))
  }

  async updateConversation(payload: ConversationPayload | string): Promise<any> {
    const conversationId = typeof payload === 'string' ? undefined : payload.conversationId
    const displayName = new Date().toLocaleString('en-us', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    return this.request('PATCH', this.appUrl(`/conversations/${conversationId}`), {
      body: { displayName },
    })
  }

  async listConversations(webhookData: UserIdentifierPayload | string): Promise<any> {
    const userIdOrExternalId = this.getUserIdOrExternalId(webhookData)
    // Legacy heuristic: a 24-char id is a SunCo userId, otherwise externalId.
    const filter =
      Object.keys(userIdOrExternalId as any).length === 24 ? 'userId' : 'userExternalId'
    return this.request('GET', this.appUrl(`/conversations`), {
      query: { [`filter[${filter}]`]: userIdOrExternalId, 'page[size]': 100 },
    })
  }

  async deleteConversation(conversationId: string): Promise<any> {
    return this.request('DELETE', this.appUrl(`/conversations/${conversationId}`))
  }

  /**
   * Pass control to another switchboard integration.
   * Authenticated with basic auth using the custom integration secret
   * (preserved from the legacy SDK behaviour).
   */
  async passControl(
    payload: ConversationPayload,
    switchboardIntegration: string | undefined = this.nextSwitchboardIntegration,
  ): Promise<any> {
    const { conversationId, metadata } = payload
    const body: Record<string, unknown> = { switchboardIntegration }
    if (metadata) {
      body.metadata = metadata
      console.log(`Switchboard metadata sent ${JSON.stringify(body, null, 2)}`)
    }
    const basic = Buffer.from(
      `${this.suncoCustomIntegrationSecret}:${this.suncoCustomIntegrationSecret}`,
    ).toString('base64')
    return this.request(
      'POST',
      this.appUrl(`/conversations/${conversationId}/passControl`),
      { body, headers: { Authorization: `Basic ${basic}` } },
    )
  }

  async offerControl(payload: ConversationPayload): Promise<any> {
    const { conversationId, metadata } = payload
    const body: Record<string, unknown> = {}
    if (metadata) {
      body.metadata = metadata
      console.log(body.metadata)
    }
    return this.request('POST', this.appUrl(`/conversations/${conversationId}/offerControl`), {
      body,
    })
  }

  async releaseControl(payload: ConversationPayload): Promise<any> {
    const { conversationId, metadata } = payload
    if (metadata) {
      console.log({ metadata })
    }
    return this.request(
      'POST',
      this.appUrl(`/conversations/${conversationId}/releaseControl`),
      { body: metadata ? { metadata } : {} },
    )
  }

  async listSwitchboards(): Promise<any> {
    return this.request('GET', this.appUrl(`/switchboards`))
  }

  async listSwitchboardIntegrations(): Promise<any> {
    return this.request(
      'GET',
      this.appUrl(`/switchboards/${this.switchboardId}/switchboardIntegrations`),
    )
  }

  async updateSwitchboard(
    enabled = true,
    defaultSwitchboardIntegrationId?: string,
  ): Promise<any> {
    const body: Record<string, unknown> = { enabled: Boolean(enabled) }
    if (defaultSwitchboardIntegrationId) {
      body.defaultSwitchboardIntegrationId = defaultSwitchboardIntegrationId
    }
    return this.request('PATCH', this.appUrl(`/switchboards/${this.switchboardId}`), { body })
  }

  async updateSwitchboardIntegration(
    payload: SwitchboardIntegrationUpdatePayload,
  ): Promise<any> {
    const {
      switchboardIntegrationId,
      nextSwitchboardIntegrationId,
      deliverStandbyEvents,
      messageHistoryCount,
    } = payload
    const body: Record<string, unknown> = {
      nextSwitchboardIntegrationId:
        nextSwitchboardIntegrationId === undefined ? undefined : nextSwitchboardIntegrationId,
      ...(deliverStandbyEvents !== undefined && {
        deliverStandbyEvents: Boolean(deliverStandbyEvents),
      }),
      messageHistoryCount:
        messageHistoryCount == 0 ? null : parseInt(messageHistoryCount as unknown as string, 10),
    }
    return this.request(
      'PATCH',
      this.appUrl(
        `/switchboards/${this.switchboardId}/switchboardIntegrations/${switchboardIntegrationId}`,
      ),
      { body },
    )
  }

  async createSwitchboardIntegration(
    integrationName: string,
    integrationId: string,
    deliverStandbyEvents: boolean,
    nextSwitchboardIntegrationId: string,
    messageHistoryCount = 10,
  ): Promise<any> {
    const body = {
      name: integrationName,
      integrationId,
      deliverStandbyEvents,
      nextSwitchboardIntegrationId,
      messageHistoryCount,
    }
    try {
      return await this.request(
        'POST',
        this.appUrl(`/switchboards/${this.switchboardId}/switchboardIntegrations`),
        { body },
      )
    } catch (error: any) {
      // Legacy path logged and returned { error } for this method specifically.
      console.log(error?.data?.errors?.[0]?.title || error)
      return { error: error?.data?.errors?.[0]?.title || error }
    }
  }

  async listIntegrations(): Promise<any> {
    return this.request('GET', this.appUrl(`/integrations`))
  }

  async updateIntegration(
    integrationId: string,
    bodyParams: Record<string, unknown>,
  ): Promise<any> {
    return this.request('PATCH', this.appUrl(`/integrations/${integrationId}`), {
      body: bodyParams,
    })
  }

  async listIntegrationsPerChannelResponder(): Promise<any> {
    return this.request('GET', this.appUrl(`/integrations`), { query: { 'page[size]': 100 } })
  }

  /**
   * Upload an attachment as multipart/form-data. `source` may be a Node
   * readable stream, Buffer, or Blob (FormData accepts all in Nitro/undici).
   */
  async uploadAttachment(source: unknown, conversationId: string): Promise<any> {
    const form = new FormData()
    form.append('source', source as any)
    const url = this.appUrl(`/attachments`)
    try {
      return await $fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.suncoJwt}` },
        query: { access: 'public', for: 'message', conversationId },
        body: form,
      })
    } catch (error: any) {
      return error?.data?.errors?.[0]?.title || error?.statusCode || error?.status
    }
  }
}

export default SunCoClient

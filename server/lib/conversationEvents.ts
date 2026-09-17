import replyToUser from './bot'
import ConversationEvent from './webhook'
import PassControlMetadata from './passControlMetadata'
import type { WebhookEnvelope } from './webhook'

/**
 * SunCo conversation webhook handler.
 * Returns a `{ status, body }` tuple the route sends back.
 */
export const handleConversationEvent = (
  body: WebhookEnvelope,
  apiKey?: string,
): { status: number; body?: unknown } => {
  const webhookEvent = new ConversationEvent(body, apiKey)
  const { webhookEventApiKey, activeSwitchboardIntegrationId, textFallback } = webhookEvent
  const metadata = new PassControlMetadata(webhookEvent)

  if (!webhookEvent.isAuthenticatedRequest(webhookEventApiKey)) {
    return { status: 401 }
  }

  if (!webhookEvent.isCurrentSwitchboardIntegration(activeSwitchboardIntegrationId)) {
    return { status: 200 }
  }

  if (webhookEvent.isConversationMessage() || webhookEvent.isConversationPostback()) {
    if (webhookEvent.isBusinessMessage()) {
      return { status: 200 }
    }

    if (webhookEvent.isTextMessage() && webhookEvent.isAllowedChannel()) {
      try {
        if (webhookEvent.userMessage) {
          replyToUser(webhookEvent, metadata)
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`)
        return { status: 500, body: { error: 'Something failed!' } }
      }
      return { status: 200 }
    } else if (webhookEvent.isAllowedChannel() && webhookEvent.ifFormMessage()) {
      try {
        if (textFallback) {
          webhookEvent.userMessage = 'form response'
          replyToUser(webhookEvent, metadata)
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`)
        return { status: 500, body: { error: 'Something failed!' } }
      }
      return { status: 200 }
    }
    return { status: 200 }
  } else if (webhookEvent.isConversationCreate()) {
    if (
      webhookEvent.isCreationReasonStartConversation() &&
      webhookEvent.isAllowedChannel()
    ) {
      try {
        webhookEvent.userMessage = 'start'
        replyToUser(webhookEvent, metadata)
      } catch (error) {
        console.log(error)
        return { status: 500, body: { error: 'Something failed!' } }
      }
      return { status: 200 }
    } else if (
      webhookEvent.isConversationCreate() &&
      webhookEvent.conversationType === 'sdkGroup'
    ) {
      webhookEvent.userMessage = 'sdkgroup'
      replyToUser(webhookEvent, metadata)
      return { status: 200 }
    }
    return { status: 200 }
  } else if (webhookEvent.isConversationRead()) {
    return { status: 200 }
  }
  return { status: 200 }
}

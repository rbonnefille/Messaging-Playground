import { handleConversationEvent } from '../../lib/conversationEvents'

/** POST /api/conversations — SunCo webhook receiver. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiKey = getRequestHeader(event, 'x-api-key')
  const result = handleConversationEvent(body, apiKey)
  setResponseStatus(event, result.status)
  return result.body ?? null
})

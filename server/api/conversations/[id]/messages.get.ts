import SunCoClient from '../../../utils/sunco'

/** GET /api/conversations/:id/messages */
export default defineEventHandler(async (event) => {
  const conversationId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const conversationMessages = await sunCo.listMessages(conversationId)
    return conversationMessages
  } catch (error) {
    console.error('Error listing conversation messages:', error)
    setResponseStatus(event, 502)
    return { error: 'Conversation service unavailable' }
  }
})

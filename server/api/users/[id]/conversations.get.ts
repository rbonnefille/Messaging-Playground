import SunCoClient from '../../../utils/sunco'

/** GET /api/users/:id/conversations */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const conversations = await sunCo.listConversations(userId)
    if (conversations && conversations.hasOwnProperty('conversations')) {
      return conversations
    }
    setResponseStatus(event, 404)
    return { error: 'Conversations not found' }
  } catch (error) {
    console.error('Error listing conversations:', error)
    setResponseStatus(event, 502)
    return { error: 'Conversation service unavailable' }
  }
})

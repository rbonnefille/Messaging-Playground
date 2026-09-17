import SunCoClient from '../../utils/sunco'

/** GET /api/conversations/:id */
export default defineEventHandler(async (event) => {
  const conversationId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const conversation = await sunCo.getConversation(conversationId)
    if (!conversation?.conversation) {
      setResponseStatus(event, 404)
      return { error: 'Conversation not found' }
    }
    return conversation.conversation
  } catch (error) {
    console.error('Error getting conversation:', error)
    setResponseStatus(event, 502)
    return { error: 'Conversation service unavailable' }
  }
})

import SunCoClient from '../../../utils/sunco'

/** DELETE /api/users/:id/conversations — delete non-default, non-agentWorkspace conversations. */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const allConversations = await sunCo.listConversations(userId)
    if (!allConversations?.conversations) {
      setResponseStatus(event, 404)
      return { error: 'Conversations not found' }
    }
    const conversationsToDelete = allConversations.conversations.filter(
      (convo: any) =>
        convo.activeSwitchboardIntegration?.name !== 'zd-agentWorkspace' && !convo.isDefault,
    )
    await Promise.all(
      conversationsToDelete.map((convo: any) => sunCo.deleteConversation(convo.id)),
    )
    return { deletedConversations: conversationsToDelete.length }
  } catch (error) {
    console.error('Error deleting conversations:', error)
    setResponseStatus(event, 502)
    return { error: 'Conversation service unavailable' }
  }
})

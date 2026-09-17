import axios from 'axios'
import pkg from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import SunCoClient from '../../utils/sunco'
const { sign } = pkg

/** POST /api/conversations/form — posts a formResponse message via the SDK endpoint. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  console.log('Form response: ', body)

  const { conversationId, messageId, sdkPlatform, sdkClientguid, sdkIntegrationId } = body

  const fields = [
    { name: 'dataCapture.ticketField.26752975385105', label: 'Booking ID', type: 'text', text: '123456' },
    { name: 'dataCapture.ticketField.27187091485073', label: 'User plan', type: 'text', text: 'Pro plan' },
    { type: 'select', name: 'dataCapture.ticketField.25310167559313', label: 'Plan', select: [{ name: '25310167558545', label: 'Professional' }] },
  ]

  const sunCo = new SunCoClient()
  const participantsResponse = await sunCo.listParticipants(conversationId)
  const user = participantsResponse?.participants[0]
  if (!user) {
    console.error('No user in the conversation!')
    setResponseStatus(event, 404)
    return { error: 'Conversation user not found' }
  }

  const token = sign(
    { scope: 'user', external_id: user.userExternalId },
    config.password,
    { header: { alg: 'HS256', kid: config.username } },
  )

  const sessionId = uuidv4()
  try {
    await axios.post(
      `https://api.smooch.io/sdk/v2/apps/${config.appId}/conversations/${conversationId}/messages`,
      {
        author: {
          role: 'appUser',
          userId: user.userExternalId,
          appUserId: user.userId,
          sessionId,
          client: { platform: sdkPlatform || 'web', id: sdkClientguid, integrationId: sdkIntegrationId },
        },
        message: { type: 'formResponse', role: 'appUser', quotedMessageId: messageId, fields },
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
          'x-smooch-sdk': sdkPlatform == 'ios' || sdkPlatform == 'android' ? sdkPlatform + '/1.0.0' : 'web/smooch/5.6.0',
        },
      },
    )
  } catch (error: any) {
    console.error('Error sending form response:', error.message)
  }
  return {}
})

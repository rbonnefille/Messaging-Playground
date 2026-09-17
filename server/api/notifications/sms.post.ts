import axios from 'axios'

/** POST /api/notifications/sms — proactive SMS via SunCo Twilio integration. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  if (!body || Object.keys(body).length === 0) {
    setResponseStatus(event, 404)
    return 'No body found'
  }
  const { destinationId, message } = body
  console.log(body)
  const payload = {
    destination: { integrationId: config.suncoTwilioIntegrationId, destinationId },
    author: { role: 'appMaker' },
    message: { type: 'text', text: message },
  }
  try {
    const response = await axios.post(
      `https://api.smooch.io/v1.1/apps/${config.appId}/notifications`,
      payload,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.suncoJwt}` } },
    )
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    return 'Something went wrong - Check destinationId and message'
  }
})

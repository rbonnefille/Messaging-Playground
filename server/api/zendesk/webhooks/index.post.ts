/** POST /api/zendesk/webhooks — logs the Zendesk webhook payload. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('Received Zendesk webhook:', JSON.stringify(body, null, 2))
  setResponseStatus(event, 200)
  return null
})

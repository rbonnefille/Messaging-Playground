export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('Received messaging webhook:', JSON.stringify(body, null, 2))
  setResponseStatus(event, 200)
  return null
})

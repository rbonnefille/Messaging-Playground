import SunCoClient from '../../utils/sunco'

/** PATCH /api/integrations/:id */
export default defineEventHandler(async (event) => {
  const integrationId = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const sunCo = new SunCoClient()
  try {
    return await sunCo.updateIntegration(integrationId, body)
  } catch (error) {
    console.error('Error updating integration:', error)
    setResponseStatus(event, 502)
    return { error: 'Integration service unavailable' }
  }
})

import SunCoClient from '../../utils/sunco'

/** GET /api/integrations */
export default defineEventHandler(async (event) => {
  const sunCo = new SunCoClient()
  try {
    return await sunCo.listIntegrationsPerChannelResponder()
  } catch (error) {
    console.error('Error listing integrations:', error)
    setResponseStatus(event, 502)
    return { error: 'Integration service unavailable' }
  }
})

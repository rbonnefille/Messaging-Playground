import SunCoClient from '../../utils/sunco'

/** GET /api/switchboards/switchboardIntegration */
export default defineEventHandler(async (event) => {
  const sunCo = new SunCoClient()
  try {
    return await sunCo.listSwitchboardIntegrations()
  } catch (error) {
    console.error('Error listing switchboard integrations:', error)
    setResponseStatus(event, 502)
    return { error: 'Switchboard service unavailable' }
  }
})

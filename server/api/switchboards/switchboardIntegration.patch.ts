import SunCoClient from '../../utils/sunco'

/** PATCH /api/switchboards/switchboardIntegration */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const sunCo = new SunCoClient()
  try {
    return await sunCo.updateSwitchboardIntegration(body)
  } catch (error) {
    console.error('Error updating switchboard integration:', error)
    setResponseStatus(event, 502)
    return { error: 'Switchboard service unavailable' }
  }
})

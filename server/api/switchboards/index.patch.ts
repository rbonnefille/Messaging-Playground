import SunCoClient from '../../utils/sunco'

/** PATCH /api/switchboards */
export default defineEventHandler(async (event) => {
  const { enabled, defaultSwitchboardIntegrationId } = await readBody(event)
  const sunCo = new SunCoClient()
  try {
    return await sunCo.updateSwitchboard(enabled, defaultSwitchboardIntegrationId)
  } catch (error) {
    console.error('Error updating switchboard:', error)
    setResponseStatus(event, 502)
    return { error: 'Switchboard service unavailable' }
  }
})

import SunCoClient from '../../utils/sunco'

/** POST /api/switchboards/switchboardIntegration */
export default defineEventHandler(async (event) => {
  const {
    integrationName, integrationId, deliverStandbyEvents,
    nextSwitchboardIntegrationId, messageHistoryCount,
  } = await readBody(event)
  const sunCo = new SunCoClient()
  try {
    return await sunCo.createSwitchboardIntegration(
      integrationName, integrationId, deliverStandbyEvents,
      nextSwitchboardIntegrationId, messageHistoryCount,
    )
  } catch (error) {
    console.error('Error creating switchboard integration:', error)
    setResponseStatus(event, 502)
    return { error: 'Switchboard service unavailable' }
  }
})

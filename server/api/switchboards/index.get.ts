import SunCoClient from '../../utils/sunco'

/** GET /api/switchboards */
export default defineEventHandler(async (event) => {
  const sunCo = new SunCoClient()
  try {
    return await sunCo.listSwitchboards()
  } catch (error) {
    console.error('Error listing switchboards:', error)
    setResponseStatus(event, 502)
    return { error: 'Switchboard service unavailable' }
  }
})

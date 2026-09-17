import SunCoClient from '../../../utils/sunco'

/** GET /api/users/:id/devices */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const devicesList = await sunCo.listDevices(userId)
    if (devicesList && devicesList.hasOwnProperty('devices')) {
      return devicesList
    }
    setResponseStatus(event, 404)
    return { error: 'Devices not found' }
  } catch (error) {
    console.error('Error listing devices:', error)
    setResponseStatus(event, 502)
    return { error: 'Device service unavailable' }
  }
})

import SunCoClient from '../../../utils/sunco'

/** GET /api/users/:id/clients */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const clientsList = await sunCo.listClients(userId)
    if (clientsList && clientsList.hasOwnProperty('clients')) {
      return clientsList
    }
    setResponseStatus(event, 404)
    return { error: 'Clients not found' }
  } catch (error) {
    console.error('Error listing clients:', error)
    setResponseStatus(event, 502)
    return { error: 'Client service unavailable' }
  }
})

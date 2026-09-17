import SunCoClient from '../../utils/sunco'

/** GET /api/users/:id */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id') as string
  const sunCo = new SunCoClient()
  try {
    const user = await sunCo.getUser(userId)
    if (user?.hasOwnProperty('user')) {
      return user
    }
    setResponseStatus(event, 404)
    return { error: 'User not found' }
  } catch (error) {
    console.error('Error getting user:', error)
    setResponseStatus(event, 502)
    return { error: 'User service unavailable' }
  }
})

import SunCoClient from '../../utils/sunco'

/** POST /api/users/listUser — find a user by email identity. */
export default defineEventHandler(async (event) => {
  const userEmail = await readBody(event)
  const sunCo = new SunCoClient()
  try {
    const user = await sunCo.getUserByEmailIdentity(userEmail)
    if (user && user.hasOwnProperty('users') && user.users.length > 0) {
      return user.users[0]
    }
    setResponseStatus(event, 404)
    return { error: 'User not found' }
  } catch (error) {
    console.error('Error finding user by email:', error)
    setResponseStatus(event, 502)
    return { error: 'User service unavailable' }
  }
})

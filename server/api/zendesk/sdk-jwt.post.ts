import pkg from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
const { sign } = pkg

/** POST /api/zendesk/sdk-jwt — Zendesk Support SDK JWT. */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const { user_token } = getQuery(event)
  const sharedKey = config.zdSupportSdkJwtSecret
  const name = 'michael scott'
  const email = 'm-scott@example.com'
  const userIdentifier = 'm-scott'

  if (!user_token) {
    setResponseStatus(event, 401)
    return 'No user_token query parameter found'
  }
  if (!sharedKey) {
    setResponseStatus(event, 401)
    return 'No shared_key environment variable found'
  }
  if (user_token !== userIdentifier) {
    setResponseStatus(event, 401)
    return 'Invalid user_token'
  }
  const payload = { iat: Math.floor(Date.now() / 1000), jti: uuidv4(), name, email }
  return { jwt: sign(payload, sharedKey, { algorithm: 'HS256' }) }
})

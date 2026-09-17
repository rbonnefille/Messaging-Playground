import Jwt from '../lib/jwt'

/**
 * POST /api/auth — mint a SunCo user JWT.
 * TODO(auth hardening): the legacy endpoint only checked the `host` header,
 * which is spoofable. In the monorepo this is same-origin so the check is
 * less critical, but this endpoint should eventually validate the caller
 * (e.g. a server-held service ticket) before minting a token for any
 * external_id. Left as-is for the scaffold.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const host = getRequestHeader(event, 'host') ?? ''
  const allowedOrigins = [
    'localhost:3000',
    'localhost:5173',
    '127.0.0.1',
    config.authorisedOrigin,
    config.authorisedOriginHc,
  ].filter(Boolean) as string[]

  if (!allowedOrigins.some((origin) => host.startsWith(origin))) {
    console.log(`[auth] Request received from ${host}`)
    setResponseStatus(event, 403)
    return { error: 'Forbidden' }
  }

  const body = await readBody(event)
  if (!body || Object.keys(body).length === 0) {
    setResponseStatus(event, 400)
    return 'Bad Request - Body needs to be provided'
  }

  const { external_id, name, email, emailVerified } = body
  const jwt = new Jwt(external_id, name, email, emailVerified)
  const jwtToken = jwt.signJwt()

  setResponseHeader(event, 'Content-Type', 'application/json')
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { token: jwtToken }
})

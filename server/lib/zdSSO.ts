import pkg from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
const { sign } = pkg

/** GET/POST /api/zendesk/login — Zendesk SSO via JWT redirect. */
export const zdssoLogin = defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const sharedKey = config.zdSsoSecret
  const body = await readBody(event).catch(() => ({}))
  const { name, email, role } = body || {}

  if (!name || !email) {
    return 'No name or email query parameter found'
  }

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    jti: uuidv4(),
    name,
    email,
    role: role ?? 'end-user',
    external_id: email,
    phone: '+15551234567',
    tags: ['sso-jwt'],
  }

  const forwardedHost = getRequestHeader(event, 'x-forwarded-host') ?? ''
  const referer = getRequestHeader(event, 'referer') ?? ''

  if (forwardedHost.includes('romain-sunco.eu.ngrok.io')) {
    const jwtToken = sign(payload, sharedKey, { algorithm: 'HS256' })
    const accessUrl = new URL('https://z3nsuncoswitchboard.zendesk.com/access/jwt')
    accessUrl.searchParams.set('jwt', jwtToken)
    return sendRedirect(event, accessUrl.toString(), 302)
  }

  if (referer.includes('http://localhost')) {
    const token = sign(payload, sharedKey, { algorithm: 'HS256' })
    console.log(`Token SSO: ${token}`)
    return { token }
  }

  return 'Referer/forwarded not allowed'
})

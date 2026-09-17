/** GET /api/zendesk — redirect to the Zendesk subdomain or the JWT endpoint. */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const { kind, return_to } = getQuery(event)
  if (kind === 'info') {
    return sendRedirect(event, `https://${config.zdSubdomain}.zendesk.com/`, 302)
  }
  const jwtUrl = new URL('https://romain-sunco.eu.ngrok.io/zendesk/jwt')
  if (return_to) jwtUrl.searchParams.set('return_to', return_to as string)
  return sendRedirect(event, jwtUrl.toString(), 302)
})

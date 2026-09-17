export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  return sendRedirect(event, `https://${config.zdSubdomain}.zendesk.com/`, 302)
})

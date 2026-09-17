/**
 * GET /api/stream — Server-Sent Events ping stream.
 * Node preset only (long-lived connection + setInterval).
 * Ported from the legacy Express SSE endpoint using h3's event stream.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const timer = setInterval(() => {
    const ts = new Date().toLocaleTimeString()
    event.node.res.write(`data: ping - timestamp: ${ts}\n\n`)
  }, 2000)

  event.node.res.on('close', () => {
    clearInterval(timer)
  })

  // h3: return a stream-friendly response; we write directly to the raw res.
  return event.node.res
})

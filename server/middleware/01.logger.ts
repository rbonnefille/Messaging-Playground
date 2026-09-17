// Replaces the legacy morgan→winston file logger.
// Nitro server middleware runs on every server request.
export default defineEventHandler((event) => {
  const start = Date.now()
  if (import.meta.dev) {
    console.log(
      `[${event.method}] ${event.path}`,
    )
  }
  event.node.res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`  ← ${event.node.res.statusCode} ${ms}ms`)
  })
})

/** GET /api/tracking — logs ticket tracking events. */
export default defineEventHandler((event) => {
  const { ticket_id, requester_id, updated_at } = getQuery(event)
  console.log(
    `Event Tracked - Ticket ID: ${ticket_id}, Requester ID: ${requester_id}, Updated At: ${updated_at}`,
  )
  setResponseStatus(event, 200)
  return 'Event tracked'
})

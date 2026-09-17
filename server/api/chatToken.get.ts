import pkg from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
const { sign } = pkg

/** GET /api/chatToken — Zendesk Chat SDK JWT. */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const payload = {
    name: 'Romain Chat',
    email: 'romdb+zendeskchat2@protonmail.com',
    external_id: uuidv4(),
  }
  console.log(payload)
  const jwt = sign(payload, config.chatSharedSecret)
  console.log(jwt)
  return { token: jwt }
})

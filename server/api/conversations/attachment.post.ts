import fs from 'node:fs'
import SunCoClient from '../../utils/sunco'

/** POST /api/conversations/attachment — uploads a hardcoded PDF (legacy). */
export default defineEventHandler(async (event) => {
  const { conversationId } = await readBody(event)
  const filePath = '/Users/rbonnefille/Downloads/pdf/dummy.pdf'
  const file = fs.createReadStream(filePath)
  const sunCo = new SunCoClient()
  try {
    const uploadResult = await sunCo.uploadAttachment(file, conversationId)
    if (!uploadResult?.attachment) {
      setResponseStatus(event, 502)
      return { error: 'Attachment upload failed' }
    }
    return uploadResult.attachment
  } catch (error) {
    console.error('Error uploading attachment:', error)
    setResponseStatus(event, 502)
    return { error: 'Attachment service unavailable' }
  }
})

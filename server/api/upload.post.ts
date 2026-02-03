// server/api/upload.post.ts
import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  try {
    const body = await readMultipartFormData(event)

    if (!body || body.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const file = body[0]

    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Must be an image' })
    }

    const filename = file.filename || `artwork-${Date.now()}.png`

    // Upload to Vercel Blob
    const blob = await put(filename, file.data, {
      access: 'public',
    })

    return { success: true, message: 'Artifact summoned successfully!', url: blob.url }
  }
  catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to upload' })
  }
})

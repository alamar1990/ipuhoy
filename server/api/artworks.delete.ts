// server/api/artworks.delete.ts
import { del } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.filename) {
      throw createError({ statusCode: 400, statusMessage: 'URL required' })
    }

    // In Vercel Blob, you delete by the URL
    await del(body.filename)

    return { success: true, message: 'Artifact banished.' }
  }
  catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete' })
  }
})

// server/api/artworks.get.ts
import { list } from '@vercel/blob'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    // List files from Vercel Blob
    const { blobs } = await list()

    return blobs.map((blob) => {
      // Extract a clean title from the pathname (e.g., "The Oracle-123123.jpg")
      const rawName = path.parse(blob.pathname).name
      // Optional: Clean up the random string Vercel might add if needed,
      // but for now, just decoding URL components is usually enough.
      const title = decodeURIComponent(rawName)

      return {
        // We use the full URL as the unique identifier for deletion
        filename: blob.url,
        title: title,
        path: blob.url,
      }
    })
  }
  catch (error) {
    console.error(error)
    return []
  }
})

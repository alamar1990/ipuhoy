// server/api/upload.post.ts
import { put } from '@vercel/blob'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readMultipartFormData(event)

    if (!body || body.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No data found' })
    }

    // 1. Find the file and the name field in the FormData array
    const file = body.find(item => item.name === 'file')
    const nameField = body.find(item => item.name === 'name')

    if (!file || !file.filename) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Must be an image' })
    }

    // 2. Determine the final filename
    // Get the extension from the original filename (e.g., .png, .jpg)
    const extension = path.extname(file.filename)

    // Get the custom name or fall back to the original filename (minus extension)
    let artworkTitle = nameField ? nameField.data.toString() : path.parse(file.filename).name

    // Sanitize title (remove weird characters that might break URLs)
    artworkTitle = artworkTitle.replace(/[^a-zA-Z0-9 \-_]/g, '').trim() || 'Untitled'

    const finalFilename = `${artworkTitle}${extension}`

    // 3. Upload to Vercel Blob
    const blob = await put(finalFilename, file.data, {
      access: 'public',
      addRandomSuffix: false, // Keep the name clean so it shows up nicely in the gallery
    })

    return { success: true, message: 'Artifact summoned successfully!', url: blob.url }
  }
  catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to upload' })
  }
})

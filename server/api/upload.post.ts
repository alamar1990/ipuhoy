// server/api/upload.post.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { process } from 'std-env'

export default defineEventHandler(async (event) => {
  try {
    // 1. Read the form data (files)
    const body = await readMultipartFormData(event)

    if (!body || body.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    // 2. Get the first file from the form
    const file = body[0]

    // Check if it's an image
    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Must be an image' })
    }

    const filename = file.filename || `artwork-${Date.now()}.png`

    // 3. Define the path: public/artworks
    const uploadPath = path.join(process.cwd(), 'public', 'artworks', filename)

    // 4. Write the file to disk
    await fs.writeFile(uploadPath, file.data)

    return { success: true, message: 'Artifact summoned successfully!' }
  }
  catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to upload' })
  }
})

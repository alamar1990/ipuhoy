import fs from 'node:fs/promises'
import path from 'node:path'
import { process } from 'std-env'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.filename) {
      throw createError({ statusCode: 400, statusMessage: 'Filename required' })
    }

    // Security: basic check to prevent deleting outside directory
    const filename = path.basename(body.filename)
    const filePath = path.join(process.cwd(), 'public', 'artworks', filename)

    await fs.unlink(filePath)

    return { success: true, message: 'Artifact banished.' }
  }
  catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete' })
  }
})

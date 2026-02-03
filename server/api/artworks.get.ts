import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler((event) => {
  // Finds the 'public/artworks' folder on your computer/server
  const artworksDir = path.join(process.cwd(), 'public', 'artworks')

  try {
    const files = fs.readdirSync(artworksDir)

    // Filters for images and creates the data list
    return files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map((file) => {
        return {
          filename: file,
          title: path.parse(file).name, // Removes extension for the title
          path: `/artworks/${file}`, // Public URL path
        }
      })
  }
  catch (error) {
    return []
  }
})

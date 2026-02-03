// server/api/auth/google.get.ts
import { process } from 'std-env'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // 1. Get allowed emails from env
    const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || []

    // 2. Check if user is allowed
    if (!user.email || !allowedEmails.includes(user.email)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Your email is not on the guardian list.',
      })
    }

    // 3. Create session
    await setUserSession(event, {
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      loggedInAt: new Date(),
    })

    // 4. Redirect back to upload page
    return sendRedirect(event, '/upload')
  },
})

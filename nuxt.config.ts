// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Modules
  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss', '@nuxt/eslint', '@nuxt/image'],
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: 'iPuhoy',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  // CSS configuration
  css: [
    '~/assets/scss/main.scss',
  ],

  runtimeConfig: {
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },

    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    allowedEmails: process.env.ALLOWED_EMAILS,
  },
  compatibilityDate: '2025-07-15',

  // Vite configuration for SCSS
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // This makes SCSS variables available in all components
          additionalData: `
            @use "sass:map";
            @use "sass:list";
            @use "sass:math";
            @use "@/assets/scss/_variables.scss" as *;
          `,
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        jsx: true,
      },

    },
  },
})

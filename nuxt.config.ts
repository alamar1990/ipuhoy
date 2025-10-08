// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
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

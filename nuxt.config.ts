// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // CSS configuration
  css: [
    '~/assets/scss/main.scss'
  ],
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint'
  ],
  
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
          `
        }
      }
    }
  },
  
  // App configuration
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
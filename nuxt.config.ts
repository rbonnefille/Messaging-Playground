// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // File-based routing + layouts are built in.
  // SPA mode — the original Vue app was a Vite SPA (no SSR), and the
  // composables touch `window`/`document` at module scope (widget SDKs).
  ssr: false,

  modules: ['@pinia/nuxt', '@vueuse/nuxt'],

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'vue-toastification/dist/index.css',
    '~/assets/css/custom-styles.scss',
  ],

  // Nitro runs on the Node preset (SSE + long-lived connections need it).
  nitro: {
    preset: 'node-server',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', href: '/whiteFavicon.png' }],
    },
  },

  // Public values are exposed to the client; private (server) values are
  // server-only and never shipped to the browser.
  runtimeConfig: {
    // --- Server-only (private) ---
    appId: '',
    podBaseUrl: '',
    baseUrl: '',
    switchboardId: '',
    suncoJwt: '',
    suncoCustomIntegrationSecret: '',
    nextSwitchboardIntegration: '',
    webhookSunco: '',
    botSwitchboardIntegrationId: '',
    username: '',
    password: '',
    botName: '',
    botAvatarUrl: '',
    defaultBotAvatarUrl: '',
    catApiKey: '',
    catApiUrl: '',
    chatSharedSecret: '',
    zdSubdomain: '',
    zdAppGuid: '',
    zdUsername: '',
    zdPassword: '',
    zdSsoSecret: '',
    zdSupportSdkJwtSecret: '',
    suncoTwilioIntegrationId: '',
    authorisedOrigin: '',
    authorisedOriginHc: '',
    // --- Public (client) ---
    public: {
      messagingKey: '',
      messagingEmeaKey: '',
      messagingApacKey: '',
      suncoIntegrationId: '',
      suncoAppId: '',
      zendeskVoiceLineId: '',
    },
  },

  typescript: {
    strict: false,
    shim: false,
  },

  // Bootstrap JS bundle is loaded client-side via a plugin; the CSS is above.
  vite: {
    optimizeDeps: {},
  },
})

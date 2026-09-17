# suncoBot — Nuxt 3 monorepo

A single Nuxt 3 app that merges the former standalone **Vue 3 SPA**
(`vue-js/dashboard/dashboard`) and the **Express 5 API**
(`suncoBot/server`) into one project. The frontend and the API share one
origin, so the browser never holds service credentials — they live only in
server-side `runtimeConfig`.

## Layout

```
.
├── nuxt.config.ts        # runtimeConfig (server + public), modules, CSS
├── app.vue               # NuxtLayout + NuxtPage + <title> via route meta
├── package.json          # merged deps (Vue/Nuxt + server SDKs)
├── .env / .env.example   # NUXT_* env vars (auto-bound to runtimeConfig)
│
├── pages/                # 17 file-based routes (from the SPA)
├── layouts/              # default / home / 404 (use <slot/>)
├── components/           # 19 UI components (auto-imported)
├── composables/          # useSunco, useZendesk, useWidgetButtons, helpers…
├── stores/               # Pinia userStore
├── services/             # apiClient + sunco/zendesk/auth services (call /api/*)
├── utils/                # SPA snippets & icons
├── assets/               # custom-styles.scss + svgs
├── public/               # favicons
├── plugins/
│   ├── bootstrap.client.js   # Bootstrap JS bundle
│   ├── toast.client.js       # vue-toastification
│   └── smooch.client.js      # SunCo Web Messenger loader (window.Smooch)
│
├── server/               # Nitro server
│   ├── api/              # all former Express routes, now under /api/*
│   │   ├── auth.post.ts
│   │   ├── conversations/…
│   │   ├── users/…
│   │   ├── switchboards/…
│   │   ├── integrations/…
│   │   ├── zendesk/…
│   │   ├── notifications/sms.post.ts
│   │   ├── chatToken.get.ts
│   │   ├── webhooks/…
│   │   ├── stream.get.ts          # SSE (Node preset)
│   │   ├── tracking.get.ts
│   │   ├── templates/index.get.ts # TODO stub
│   │   └── messageTemplates.get.ts# TODO stub
│   ├── utils/           # sunco.ts, zdApi.ts, catApi.ts, chuckNorrisApi.ts
│   ├── lib/             # jwt, webhook, BotResponse, bot, botActions, zdSSO…
│   └── middleware/01.logger.ts   # console request logger (replaces morgan/winston)
│
└── legacy-server/        # original Express app (kept for reference)
└── legacy-client/        # original static iframe client (kept for reference)
```

## Scripts

```bash
npm run dev        # dev server on :3000 (SPA + Nitro API same origin)
npm run build      # production build → .output/
npm run preview    # preview the production build
```

## Environment

All config flows through `runtimeConfig` in `nuxt.config.ts`. Env vars use the
`NUXT_` prefix and are auto-bound to the camelCase keys:

- **Server-only** (never shipped to the browser): `NUXT_APP_ID`,
  `NUXT_SUNCO_JWT`, `NUXT_SUNCO_CUSTOM_INTEGRATION_SECRET`, `NUXT_PASSWORD`,
  `NUXT_USERNAME`, `NUXT_ZD_*`, `NUXT_WEBHOOK_SUNCO`, …
- **Public** (exposed via `useRuntimeConfig().public`):
  `NUXT_PUBLIC_MESSAGING_KEY`, `NUXT_PUBLIC_SUNCO_INTEGRATION_ID`,
  `NUXT_PUBLIC_SUNCO_APP_ID`, `NUXT_PUBLIC_ZENDESK_VOICE_LINE_ID`, …

See `.env.example` for the full list.

## What changed vs. the legacy apps

- **Routing**: SPA `unplugin-vue-router` `<route>` blocks → Nuxt
  `definePageMeta({ title, layout })`. Layouts use `<slot/>` (Nuxt injects
  `<NuxtPage>` as the layout slot).
- **API base path**: the SPA called relative roots (`/auth`, `/users/:id`…);
  services now call `/api/*` to avoid conflicts with SPA page paths
  (e.g. `/zendesk` is both a page and an API resource).
- **Env**: `import.meta.env.VITE_*` → `useRuntimeConfig().public.*`;
  `process.env.*` server-side → `useRuntimeConfig()` (auto-imported in Nitro).
- **SSR**: disabled (`ssr: false`) — the SPA's composables touch
  `window`/`document` at module scope (widget SDKs), so SPA mode matches the
  original deployment and avoids hydration hazards.
- **SunCo SDK**: replaced with direct `$fetch` REST calls. The
  `sunshine-conversations-client` SDK is gone — no more global
  `ApiClient.instance` singleton, so `passControl` no longer needs to restore
  bearer auth and there's no concurrency hazard. Server bundle dropped from
  6.26 MB to 2.72 MB.

## Known TODOs (not in scope of this scaffold)

1. **Auth hardening** — the real goal of the merge. `/api/auth` still only
   checks the `host` header; add JWT verification middleware on the data routes
   and move the token into an httpOnly cookie so the SPA never holds it.
2. **Webhook signatures** — SunCo webhook uses a plain `x-api-key` equality
   check; Zendesk webhooks are unauthenticated. Add HMAC signature
   verification.
3. **`/api/templates` & `/api/messageTemplates`** — stubbed; were not present
   in the legacy server. Implement against the SunCo templates API.
4. **Single-file iframe build** — the SPA built a single inlined `index.html`
   for the Zendesk iframe via `vite-plugin-singlefile`. Nuxt has no direct
   equivalent; revisit the iframe deployment (`nuxt generate` + post-process,
   or serve the Nuxt app directly).
6. **`legacy-server/` & `legacy-client/`** — delete once parity is confirmed.

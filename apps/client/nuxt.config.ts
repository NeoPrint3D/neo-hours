import { drizzleImportNames, tableNames } from "@neo-hours/db";

export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  build: {
    transpile: ["@neo-hours/db"],
  },

  vite: {
    optimizeDeps: {
      include: ["@neo-hours/db"],
    },
  },
  // buildDir: process.env.NUXT_PLATFORM === "mobile" ? "build/mobile" : "build/web",
  // ssr: process.env.NUXT_PLATFORM === "web",
  css: ["~/assets/css/global.css"],
  modules: [
    "@nuxthub/core",
    // process.env.NUXT_PLATFORM === "web" && "@nuxthub/core",
    // process.env.NUXT_PLATFORM === "mobile" && "@nuxtjs/ionic",
    "@nuxt/eslint",
    "@formkit/auto-animate",
    // "@vite-pwa/nuxt",
    "nuxt-icon",
    "nuxt-typed-router",
    // "nuxt-og-image",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/motion/nuxt",
    "@nuxtjs/device",
    "@nuxtjs/plausible",
    "dayjs-nuxt",
  ],
  device: {
    refreshOnResize: true,
  },
  sourcemap: {
    server: true,
  },
  // pwa: {
  //   registerType: "autoUpdate",
  //   disable: true,
  // },
  plausible: {
    apiHost: "https://plausible.neoprint3d.dev",
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/logo.svg",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_11__iPhone_XR_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/13__iPad_Pro_M4_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/12.9__iPad_Pro_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/11__iPad_Pro_M4_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/10.9__iPad_Air_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/10.5__iPad_Air_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/10.2__iPad_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/pwa/splashscreens/8.3__iPad_Mini_landscape.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_11__iPhone_XR_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/13__iPad_Pro_M4_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/12.9__iPad_Pro_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/11__iPad_Pro_M4_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/11__iPad_Pro__10.5__iPad_Pro_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/10.9__iPad_Air_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/10.5__iPad_Air_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/10.2__iPad_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png",
        },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/pwa/splashscreens/8.3__iPad_Mini_portrait.png",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
      ],
    },
  },

  compatibilityDate: "2024-06-17",
  experimental: {
    viewTransition: true,
    componentIslands: true,
  },
  imports: {
    dirs: ["lib/**/*.ts"],
    imports: [
      {
        name: "z",
        from: "zod",
      },
      {
        name: "toast",
        from: "vue-sonner",
      },
      ...[...tableNames, "createId", ...drizzleImportNames].map((name) => ({
        name,
        from: "@neo-hours/db",
      })),
    ],
  },
  nitro: {
    experimental: {
      openAPI: true,
    },

    imports: {
      dirs: ["server/database/*.ts", "lib/**/*.ts"],
      imports: [
        {
          name: "z",
          from: "zod",
        },
        ...[...tableNames, "createId", ...drizzleImportNames].map((name) => ({
          name,
          from: "@neo-hours/db",
        })),
      ],
    },
  },
  hub: {
    database: true,
    kv: true,
    dir: "../../packages/db/.data",
  },
  shadcn: {
    prefix: "UI",
  },
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },
  fonts: {
    provider: "google",
    families: [
      {
        name: "Raleway",
      },
    ],
  },
  eslint: {
    config: {},
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_BASE_URL,
    },
    brevo: {
      senderEmail: process.env.NUXT_BREVO_SENDER_EMAIL,
      apiKey: process.env.NUXT_BREVO_API_KEY,
    },
    // smtp: {
    //   username: process.env.NUXT_NODMAILER_USERNAME,
    //   password: process.env.NUXT_NODMAILER_PASSWORD,
    // },
  },
});

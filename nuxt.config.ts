export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@bootstrap-vue-next/nuxt", "@nuxt/scripts"],

  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap-icons/font/bootstrap-icons.css",
    "assets/main.sass",
  ],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  app: {
    head: {
      title: "誠得隨機抽籤系統",
      meta: [
        {
          name: "description",
          content:
            "本工具為抽獎程式、抽籤程式、名單抽獎、尾牙抽獎、Lucky draw、Random name picker",
        },
        {
          name: "og:title",
          content: "誠得隨機抽籤系統",
        },
        {
          name: "og:image",
          content: "/chengde.png",
        },
        {
          name: "og:description",
          content:
            "誠得有限公司提供的隨機抽籤系統，可自行上傳抽獎名單及獎品，是尾牙及社群粉專抽獎的好幫手",
        },
      ],
      link: [{ rel: "icon", type: "image/jpg", href: "/favicon.jpg" }],
    },
  },

  scripts: {
    registry: {
      googleAdsense: {
        client: "ca-pub-3150973761963926", // Your Google AdSense Publisher ID
        autoAds: true, // Enable Auto Ads
      },
    },
  },

  compatibilityDate: "2025-03-15",
});
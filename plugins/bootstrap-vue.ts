import { createBootstrap } from "bootstrap-vue-next";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(
    createBootstrap({
      components: false,
      directives: false,
      plugins: {
        id: {
          getId: () => useId(),
        },
        components: {
          BModal: {
            teleportTo: "#teleports",
          },
        },
      },
    })
  );
});

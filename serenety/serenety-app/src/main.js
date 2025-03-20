import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import googleLogin from "vue3-google-login";

const app = createApp(App);

app.use(googleLogin, {
  clientId:
    "918102923184-5tg9cgba9m9m64moj6njkodndu148iel.apps.googleusercontent.com",
});

app.use(router);
app.use(store);
app.mount("#app");

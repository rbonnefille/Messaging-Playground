import App from "./components/App.js";
import ZDClient from "./services/ZDClient.js";

let app = {};
const initVueApp = async () => {
  app = Vue.createApp(App);
  app.mount("#app");
};

ZDClient.init();
initVueApp();

export { app };

import { createApp } from "vue";
import { createPinia } from "pinia";
import { Can, abilitiesPlugin } from "@casl/vue";
import i18n from "@/i18n.config";

import ElementPlus from "element-plus";
import ru from "element-plus/es/locale/lang/ru";
import "./assets/element/index.scss";
import "./assets/main.css";

import "dayjs/locale/ru";
import "dayjs/locale/en";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// app.use(abilitiesPlugin, ability);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(ElementPlus, {
  locale: ru,
});

app.config.globalProperties.$dayjs = dayjs.locale(i18n.global.locale.value);
app.config.globalProperties.$dayjs = dayjs.extend(utc);
app.config.globalProperties.$dayjs = dayjs.extend(duration);

app.mount("#app");

import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";

let locale = localStorage.getItem("app.language") ?? "ru";
const i18n = createI18n({
  locale,
  legacy: false,
  globalInjection: true,
  messages: {
    en,
    ru,
  },
});

export default i18n;

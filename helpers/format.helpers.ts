import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

export const formatDayTime = (
  v: string | null,
  local: boolean = false,
  format: string = "DD.MM.YYYY HH:mm"
) => {
  if (!v) return "";

  return local
    ? dayjs(v, { utc: true }).local().format(format)
    : dayjs(v).format(format);
};
export const formatDay = (v: string | null) => {
  if (!v) return "";
  return dayjs(v).format("DD.MM.YYYY");
};
export const formatDateToServer = (v: string) => {
  return v && v.trim() != "" ? dayjs(v).format("YYYY-MM-DD") : undefined;
};
export const formatDateTimeToServer = (v: string) => {
  return v && v.trim() != "" ? dayjs(v).format("YYYY-MM-DD HH:mm") : undefined;
};

export const formatCurrency = (v: number | string | undefined) => {
  const { locale } = useI18n();
  const { userProfile } = storeToRefs(useUserStore());

  const value = Number(v) || 0;

  // Форматируем ЧИСЛО без валюты
  const formatted = new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  let symbol = "₽";

  if (userProfile.value?.country?.toLowerCase() === "kz") {
    symbol = "₸"; // Казахстан
  } else if (!locale.value.includes("ru")) {
    symbol = "$"; // Остальные страны
  }

  return `${formatted} ${symbol}`;
};
export function formatWithoutCurrency(
  value: number | string | undefined
): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export const formatDecimal = (value: string) =>
  value.replace(/[^\d.,]|(\.\d{2})\d+/g, "$1");

export const stringToColor = (
  str: string
): { text: string; border: string; background: string } => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  const text = color;
  const border = color + "CC";
  const background = color + "33";

  return { text, border, background };
};

export const declOfNum = (n: number, arr: string[]) => {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    return arr[2];
  }
  if (n1 > 1 && n1 < 5) {
    return arr[1];
  }
  // eslint-disable-next-line eqeqeq
  if (n1 == 1) {
    return arr[0];
  }
  return arr[2];
};

export const formatToLocalISOString = (date: string, time: string) => {
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
};

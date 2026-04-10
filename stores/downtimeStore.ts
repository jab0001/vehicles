import { defineStore } from "pinia";
import { useDowntime } from "@/composables/useDowntime";

export const useDowntimeStore = defineStore("useDowntime", () => useDowntime());

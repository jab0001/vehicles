import { defineStore } from "pinia";
import { useApp } from "@/composables/useApp";

export const useAppStore = defineStore("AppStore", () => useApp());

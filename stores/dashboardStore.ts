import { defineStore } from "pinia";
import { useDashboard } from "@/composables/useDashboard";

export const useDashboardStore = defineStore("DashboardStore", () => useDashboard());
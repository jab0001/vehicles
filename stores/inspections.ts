import { defineStore } from "pinia";
import { useInspections } from "@/composables/useInspections";

export const useInspectionsStore = defineStore("useInspections", () => useInspections());

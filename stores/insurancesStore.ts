import { defineStore } from "pinia";
import { useInsurances } from "@/composables/useInsurances";

export const useInsurancesStore = defineStore("InsurancesStore", () => useInsurances());

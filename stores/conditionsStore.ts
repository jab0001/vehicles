import { defineStore } from "pinia";
import { useConditions } from "@/composables/useConditions";

export const useConditionsStore = defineStore("conditionsStore", () =>
  useConditions()
);
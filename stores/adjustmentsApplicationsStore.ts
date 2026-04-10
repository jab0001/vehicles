import { defineStore } from "pinia";
import { useAdjustmentsApplications } from "@/composables/useAdjustmentsApplications";

export const useAdjustmentsApplicationsStore = defineStore(
  "AdjustmentsApplicationsStore",
  () => useAdjustmentsApplications()
);

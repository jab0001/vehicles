import { defineStore } from "pinia";
import { useMaintenance } from "@/composables/useMaintenance";

export const useMaintenanceStore = defineStore("maintenanceStore", () =>
  useMaintenance()
);

import { defineStore } from "pinia";
import { useVehiclesOnLine } from "@/composables/useVehiclesOnLine";

export const useVehiclesOnLineStore = defineStore("vehiclesOnLineStore", () =>
  useVehiclesOnLine()
);

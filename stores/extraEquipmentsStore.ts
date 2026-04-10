import { defineStore } from "pinia";
import { useExtraEquipments } from "@/composables/useExtraEquipments";

export const useExtraEquipmentsStore = defineStore("extraEquipmentsStore", () =>
  useExtraEquipments()
);

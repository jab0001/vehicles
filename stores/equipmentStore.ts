import { defineStore } from "pinia";
import { useEquipment } from "@/composables/useEquipment";

export const useEquipmentStore = defineStore("equipmentStore", () =>
  useEquipment()
);
import { defineStore } from "pinia";
import {
  useVehicleDowntime,
  useVehicles,
  useVehiclesRent,
  useVehiclesInsurance,
  useVehiclesDiagnosticCards,
  useVehiclesLeasings,
  useVehicleEquipment,
  useVehicleGroups,
  useVehiclesMileage
} from "@/composables/useVehicles";

export const useVehiclesStore = defineStore("useVehicles", () => useVehicles());
export const useVehiclesRentStore = defineStore("useVehiclesRent", () =>
  useVehiclesRent()
);
export const useVehicleEquipmentStore = defineStore("useVehicleEquipment", () =>
  useVehicleEquipment()
);
export const useVehicleDowntimeStore = defineStore("useVehicleDowntime", () =>
  useVehicleDowntime()
);
export const useVehicleGroupsStore = defineStore("useVehicleGroups", () =>
  useVehicleGroups()
);
export const useVehiclesInsuranceStore = defineStore("useVehiclesInsurance", () =>
  useVehiclesInsurance()
);
export const useVehiclesMileageStore = defineStore("useVehiclesMileage", () =>
  useVehiclesMileage()
);
export const useVehiclesDiagnosticCardsStore = defineStore("useVehiclesDiagnosticCards", () =>
  useVehiclesDiagnosticCards()
);
export const useVehiclesLeasingsStore = defineStore("useVehiclesLeasings", () =>
  useVehiclesLeasings()
);

import { defineStore } from "pinia";
import { useDrivers, useDriverBalanceAggegate } from "@/composables/useDrivers";

export const useDriversStore = defineStore("driversStore", () => useDrivers());
export const useDriverBalanceAggegateStore = defineStore("driverBalanceAggegateStore", () => useDriverBalanceAggegate());
import { defineStore } from "pinia";
import { useWorkingShifts } from "@/composables/useWorkingShifts";

export const useWorkingShiftsStore = defineStore("workingShiftsStore", () => useWorkingShifts());
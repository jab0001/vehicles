import { defineStore } from "pinia";
import { useCashRegisters } from "@/composables/useCashRegisters";

export const useCashRegistersStore = defineStore("CashRegistersStore", () =>
  useCashRegisters()
);

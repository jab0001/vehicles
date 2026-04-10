import { defineStore } from "pinia";
import { useBalanceOperations } from "@/composables/useBalanceOperations";

export const useBalanceOperationsStore = defineStore(
  "BalanceOperationsStore",
  () => useBalanceOperations()
);

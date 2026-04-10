import { defineStore } from "pinia";
import { usePaymentTerminals } from "@/composables/usePaymentTerminals";

export const usePaymentTerminalsStore = defineStore("PaymentTermionalsStore", () =>
  usePaymentTerminals()
);

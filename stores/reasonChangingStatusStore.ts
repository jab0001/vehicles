import { defineStore } from "pinia";
import { useReasonChangingStatus } from "@/composables/useReasonChangingStatus";

export const useReasonChangingStatusStore = defineStore(
  "ReasonChangingStatus",
  () => useReasonChangingStatus()
);

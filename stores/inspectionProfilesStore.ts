import { defineStore } from "pinia";
import { useInspectionProfiles } from "@/composables/useInspectionProfiles";

export const useInspectionProfilesStore = defineStore(
  "useInspectionProfiles",
  () => useInspectionProfiles()
);

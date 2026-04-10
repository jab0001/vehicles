import { defineStore } from "pinia";
import { useInspectionsSchedule } from "@/composables/useInspectionsSchedule";

export const useInspectionsScheduleStore = defineStore("inspectionsScheduleStore", () =>
  useInspectionsSchedule()
);

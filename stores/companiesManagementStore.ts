import { defineStore } from "pinia";
import { useCompaniesManagement } from "@/composables/useCompaniesManagement";

export const useCompaniesManagementStore = defineStore("CompaniesManagementStore", () =>
  useCompaniesManagement()
);

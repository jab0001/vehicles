import { defineStore } from "pinia";
import { useIntegrations, useIntegrationsImport } from "@/composables/useIntegrations";

export const useIntegrationsStore = defineStore("integrationsStore", () =>
  useIntegrations()
);
export const useIntegrationsImportStore = defineStore("integrationsImportStore", () => useIntegrationsImport());

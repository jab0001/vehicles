import { defineStore } from "pinia";
import { useRolesApi } from "@/composables/useRolesApi";

export const useRolesApiStore = defineStore("rolesApiStore", () =>
  useRolesApi()
);

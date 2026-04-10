import { defineStore } from "pinia";
import { useRepairs } from "@/composables/useRepairs";

export const useRepairsStore = defineStore("repairsStore", () => useRepairs());

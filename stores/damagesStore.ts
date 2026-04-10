import { defineStore } from "pinia";
import { useDamages } from "@/composables/useDamages";

export const useDamagesStore = defineStore("DamagesStore", () => useDamages());

import { defineStore } from "pinia";
import { useDrafts } from "@/composables/useDrafts";

export const useDraftsStore = defineStore("draftsStore", () => useDrafts());

import { defineStore } from "pinia";
import { useFines } from "@/composables/useFines";

export const useFinesStore = defineStore("finesStore", () => useFines());

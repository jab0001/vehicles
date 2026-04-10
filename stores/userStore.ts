import { defineStore } from "pinia";
import { useUser } from "@/composables/useUser";

export const useUserStore = defineStore("userStore", () => useUser());

import { defineStore } from "pinia";
import { useCheckExtra } from "@/composables/useCheckExtra";

export const useCheckExtraStore = defineStore("checkExtraStore", () =>
    useCheckExtra()
);
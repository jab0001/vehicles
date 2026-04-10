import { defineStore } from "pinia";
import { useApp } from "@/composables/useApp";
import { useAppDriverGroup } from "@/composables/useAppDriver";

export const useAppDriverGroupStore = defineStore("AppDriverGroupStore", () =>
  useAppDriverGroup()
);

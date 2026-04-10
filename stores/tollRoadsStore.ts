import { defineStore } from "pinia";
import { useTollRoads } from "@/composables/useTollRoads";

export const useTollRoadsStore = defineStore("tollRoadsStore", () =>
  useTollRoads()
);

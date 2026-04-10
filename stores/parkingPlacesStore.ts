import { defineStore } from "pinia";
import { useParkingPlaces } from "@/composables/useParkingPlaces";

export const useParkingPlacesStore = defineStore("parkingPlacesStore", () =>
    useParkingPlaces()
);

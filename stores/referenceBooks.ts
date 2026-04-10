import { defineStore } from "pinia";
import { useReferenceBooks } from "@/composables/useReferenceBooks";

export const useReferenceBooksStore = defineStore("useReferenceBooks", () =>
  useReferenceBooks()
);
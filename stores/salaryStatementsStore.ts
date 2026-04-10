import { defineStore } from "pinia";
import { useSalaryStatements } from "@/composables/useSalaryStatements";

export const useSalaryStatementsStore = defineStore("salaryStatementsStore", () => useSalaryStatements());
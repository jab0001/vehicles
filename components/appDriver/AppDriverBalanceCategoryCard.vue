<script setup lang="ts">
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { formatCurrency } from "@/helpers/format.helpers";
import type { TBalanceOperationsCategory } from "@/types/balanceOperations";

defineProps<{
  operation: {
    total: string;
    category: TBalanceOperationsCategory;
  };
}>();

const { getBalanceOperationCategory } = useBalanceOperations();

const getTagType = (total: string | number) => {
  if (Number(total) > 0) return "success";
  if (Number(total) < 0) return "danger";
  return "info";
};
const getBalanceWithPrefix = (total: string | number) => {
  let prefix = "";
  if (Number(total) > 0) prefix = "+";
  // if (Number(total) < 0) prefix = "-";
  return `${prefix}${formatCurrency(total)}`;
};
</script>

<template>
  <div class="flex items-center justify-between p-4">
    <div class="text-lg font-medium">
      {{ getBalanceOperationCategory(operation.category) }}
    </div>
    <el-tag :type="getTagType(operation.total)">{{
      getBalanceWithPrefix(operation.total)
    }}</el-tag>
  </div>
</template>

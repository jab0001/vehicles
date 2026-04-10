<script setup lang="ts">
import { computed } from "vue";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { formatCurrency, formatDayTime } from "@/helpers/format.helpers";
import AppDriverBaseDesc from "./AppDriverBaseDesc.vue";
import type { IBalanceOperationDetails } from "@/types/balanceOperations";

const props = defineProps<{
  operation: IBalanceOperationDetails;
}>();

const { getBalanceOperationCategory } = useBalanceOperations();

const isReplenishment = computed(() => {
  return Number(props.operation.amount) > 0;
});
const operationText = computed(() => {
  return isReplenishment.value ? "Пополнение" : "Списание";
});
</script>

<template>
  <div class="flex flex-col gap-6 px-4">
    <div class="flex items-center gap-2">
      <el-tag :type="isReplenishment ? 'success' : 'danger'">{{
        operationText
      }}</el-tag>
      <p class="text-sm font-medium leading-6">№ {{ operation.id }}</p>
    </div>

    <AppDriverBaseDesc label="Сумма операции"
      ><p class="text-xl font-medium">
        {{ formatCurrency(operation.amount) }}
      </p></AppDriverBaseDesc
    >
    <div class="grid grid-cols-2 gap-x-2 gap-y-6">
      <AppDriverBaseDesc
        label="Вид операции"
        :text="getBalanceOperationCategory(operation.operation_category)"
      />
      <AppDriverBaseDesc
        label="Дата операции"
        :text="formatDayTime(operation.created_at)"
      />
    </div>

    <!-- TODO system_description or user_description -->
    <AppDriverBaseDesc label="Комментарий" :text="operation.user_description" />
  </div>
</template>

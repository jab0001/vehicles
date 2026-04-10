<script setup lang="ts">
import { computed } from "vue";
import { formatCurrency, formatDayTime } from "@/helpers/format.helpers";
import type { IBalanceOperationDetails } from "@/types/balanceOperations";

const props = defineProps<{
  operation: IBalanceOperationDetails;
}>();

const isReplenishment = computed(() => {
  return Number(props.operation.amount) > 0;
});
const operationText = computed(() => {
  return isReplenishment.value ? "Пополнение" : "Списание";
});
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-0.5 justify-between py-4 px-5"
  >
    <div class="w-full flex items-center justify-between">
      <p class="font-medium">{{ operation.id }}</p>
      <p class="font-medium">
        {{ formatCurrency(operation.amount) }}
      </p>
    </div>
    <div class="w-full flex items-center justify-between">
      <p class="text-[var(--text-color-secondary)]">
        {{ formatDayTime(operation.created_at) }}
      </p>
      <p
        :class="{
          'text-[var(--text-color-success)]': isReplenishment,
          'text-[var(--text-color-error)]': !isReplenishment,
        }"
      >
        {{ operationText }}
      </p>
    </div>
  </div>
</template>

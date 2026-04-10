<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { formatCurrency } from "@/helpers/format.helpers";

const props = defineProps<{
  block: {
    title: string;
    accrual: string;
    profit: string;
    color: string;
  };
  currentSelect: string;
  totalOperationSum: number;
}>();

const calculateSum = computed(() => {
  const operationSum = props.currentSelect === "accrual" ? (+props.block.accrual * -1) : +props.block.profit;

  return {
    operationSum,
    operationPercent: (operationSum / props.totalOperationSum) * 100, 
  }
});
</script>

<template>
  <div class="py-2 pr-4 pl-3 bg-[#F2F3F5] rounded-xl">
    <div class="w-full flex justify-between">
      <p
        class="text-[12px] border-[1px] rounded-full px-2"
        :style="{ color: props.block.color, borderColor: props.block.color }"
      >
        {{ props.block.title }}
      </p>
      <span class="text-[12px] text-[#909399]"
        >{{
          calculateSum.operationPercent ? Math.round(calculateSum.operationPercent) : 0
        }}%</span
      >
    </div>
    <p class="font-medium text-[18px] pt-[4px]">
      {{ formatCurrency(calculateSum.operationSum) ?? 0 }}
    </p>
  </div>
</template>

<style scoped></style>

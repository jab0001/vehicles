<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import {
  formatCurrency,
  formatDayTime,
  formatWithoutCurrency,
} from "@/helpers/format.helpers";

const { FinesDashboard } = storeToRefs(useDashboardStore());
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

const finesData = computed(() => {
  return FinesDashboard.value
    ? FinesDashboard.value
    : {
        fines_sum_discount_expired: "0",
        fines_sum_discount: "0",
        fines_count_discount_expired: 0,
        fines_count_discount: 0,
        fines_sum_without_discount: "0",
        fines_sum_with_discount: "0",
        fines_count_without_discount: 0,
        fines_count_with_discount: 0,
        fines_count_total: 0,
        fines_count_delta: 0,
        fines_sum_total: "0",
        fines_sum_delta: "0",
        fines_count_lt_7_days_discount_expires: 0,
        fines_count_lt_3_days_discount_expires: 0,
        fines_count_lt_1_day_discount_expires: 0,
        fines_count_gt_7_days_discount_expires: 0,
      };
});

const finesDelta = (fines_total: string, fines_delta: string) => {
    const result = formatWithoutCurrency(
    (Number(fines_delta) / Number(fines_total)) * 100
  )
  return {
    number: result,
    upper: Number(fines_delta) > 0
  }
};
</script>

<template>
  <div
    class="w-[300px] rounded-[24px] bg-[#fff] flex flex-col justify-between px-6 py-5"
    @click=""
  >
    <div class="flex items-center justify-between gap-2.5">
      <span class="text-[14px] font-medium">Штрафы</span>
      <span class="text-[#909399] text-xs">оплачиваемые парком</span>
    </div>
    <div class="flex items-baseline justify-between">
      <div class="flex flex-col gap-1">
        <p class="flex text-[20px] leading-none font-medium gap-1">
          {{ formatWithoutCurrency(finesData.fines_sum_total) ?? 0 }}
          <span class="text-xs">{{ userProfileLocalCurrencySymbol }}</span>
        </p>
        <p class="text-[#909399] text-xs">
          {{ formatCurrency(finesData.fines_sum_delta) }}
          <span
            class="text-[12px] text-red-500 leading-none"
            v-if="finesDelta(finesData.fines_sum_total, finesData.fines_sum_delta).upper"
            >&#9650;</span
          >
          <span class="text-[12px] text-green-500 leading-none" v-else
            >&#9660;</span
          >

          {{ finesDelta(finesData.fines_sum_total, finesData.fines_sum_delta).number }}%
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-[13px] leading-none font-medium">
          {{ formatWithoutCurrency(finesData.fines_count_total) }}шт
        </p>
        <p class="text-[#909399] leading-none text-xs">
          {{ formatWithoutCurrency(finesData.fines_count_delta) }} шт
        </p>
      </div>
    </div>
    <div class="flex h-[162px] gap-[2px] w-full mt-[7px]">
      <div
        class="w-[156px] bg-[#F2F3F5] px-[12px] py-[12px] rounded-l-[12px] flex flex-col justify-between"
      >
        <div>
          <p class="text-[#4EB756] text-xs">Со скидкой</p>
          <p class="text-xs font-medium">
            {{ formatCurrency(finesData.fines_sum_with_discount) }}
          </p>
          <p class="text-xs text-[#909399]">
            {{ formatWithoutCurrency(finesData.fines_count_with_discount) }}
            шт
          </p>
        </div>
        <div class="grid grid-cols-2 h-[87px] gap-1 items-end">
          <div class="flex flex-col">
            <p class="text-xs text-[#909399]">более 7д</p>
            <p class="text-xs">
              {{
                formatWithoutCurrency(
                  finesData.fines_count_gt_7_days_discount_expires
                )
              }}
              шт
            </p>
          </div>
          <div class="flex flex-col">
            <p class="text-xs text-[#909399]">менее 7д</p>
            <p class="text-xs">
              {{
                formatWithoutCurrency(
                  finesData.fines_count_lt_7_days_discount_expires
                )
              }}
              шт
            </p>
          </div>
          <div class="flex flex-col">
            <p class="text-xs text-[#909399]">менее 3д</p>
            <p class="text-xs">
              {{
                formatWithoutCurrency(
                  finesData.fines_count_lt_3_days_discount_expires
                )
              }}
              шт
            </p>
          </div>
          <div class="flex flex-col">
            <p class="text-xs text-[#909399]">1 день</p>
            <p class="text-xs">
              {{
                formatWithoutCurrency(
                  finesData.fines_count_lt_1_day_discount_expires
                )
              }}
              шт
            </p>
          </div>
        </div>
      </div>
      <div class="w-[94px] flex flex-col gap-[2px]">
        <div
          class="h-[73px] bg-[#F2F3F5] rounded-tr-[12px] px-[12px] py-[12px]"
        >
          <p class="text-[#FF8D14] text-xs">Без скидки</p>
          <p class="text-xs font-medium">
            {{ formatCurrency(finesData.fines_sum_without_discount) }}
          </p>
          <p class="text-xs text-[#909399]">
            {{ formatWithoutCurrency(finesData.fines_count_without_discount) }}
            шт
          </p>
        </div>
        <div
          class="h-[87px] bg-[#F2F3F5] rounded-br-[12px] px-[14px] py-[12px]"
        >
          <p class="text-[#FD503D] text-xs">Скидка истекла</p>
          <p class="text-xs font-medium">
            {{ formatCurrency(finesData.fines_sum_discount_expired) }}
          </p>
          <p class="text-xs text-[#909399]">
            {{ formatWithoutCurrency(finesData.fines_count_discount_expired) }}
            шт
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #fff;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}
</style>

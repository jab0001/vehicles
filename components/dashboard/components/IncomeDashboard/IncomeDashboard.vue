<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import incomeDashboardChart from "@/components/dashboard/components/IncomeDashboard/components/IncomeDasboardChart.vue";
import IncomeDashboardStatic from "@/components/dashboard/components/IncomeDashboard/components/IncomeDashboardStatistic.vue";
import { useDashboardStore } from "@/stores/dashboardStore";

const { dashboardFinanceStats } = storeToRefs(useDashboardStore());

const currentSelect = ref("accrual");

const calculatedData = computed(() => {
  const keys = ["rent", "redemption", "other"] as const;

  let accrualSum = 0;
  let profitSum = 0;
  const resultForGraph: {
    colors: string[];
    accrualNumbers: number[];
    profitNumbers: number[];
  } = {
    colors: [],
    accrualNumbers: [],
    profitNumbers: [],
  };

  keys.forEach((key) => {
    const accrual = +dashboardFinanceStats.value[key].accrual || 0;
    const profit = +dashboardFinanceStats.value[key].profit || 0;
    accrualSum += accrual;
    profitSum += profit;
    resultForGraph.colors.push(dashboardFinanceStats.value[key].color);
    resultForGraph.accrualNumbers.push(Math.round(accrual * -1));
    resultForGraph.profitNumbers.push(Math.round(profit));
  });

  return {
    accrualAndProfit: [
      {
        title: "Начислено",
        name: "accrual",
        sum: accrualSum * -1,
      },
      {
        title: "Оплачено",
        name: "profit",
        sum: profitSum,
      },
    ],
    resultForGraph,
  };
});

const changeSelected = (v: string) => {
  currentSelect.value = v;
};
</script>

<template>
  <div class="w-full flex items-center px-5 gap-8">
    <incomeDashboardChart
      :values="calculatedData.resultForGraph"
      :currentSelect="currentSelect"
    />
    <IncomeDashboardStatic
      :headerData="calculatedData.accrualAndProfit"
      :currentSelect="currentSelect"
      @changeSelected="changeSelected"
    />
  </div>
</template>

<style scoped></style>

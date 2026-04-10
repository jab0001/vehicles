<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { Chart, Tooltip, Legend, ArcElement, Title } from "chart.js";
import { computed } from "vue";

Chart.register(Tooltip, Legend, ArcElement, Title);

const props = defineProps<{
  values: {
    colors: string[];
    accrualNumbers: number[];
    profitNumbers: number[];
  };
  currentSelect: string;
}>();

const chartData = computed(() => ({
  labels: [],
  datasets: [
    {
      data: [100],
      backgroundColor: "#F2F3F5",
      borderWidth: 0,
      cutout: "70%",
      circumference: 360,
      rotation: -90,
      hoverOffset: 0,
    },
    {
      data: props.currentSelect === "accrual" ? props.values.accrualNumbers : props.values.profitNumbers,
      backgroundColor: props.values.colors,
      borderColor: "#F2F3F5",
      borderWidth: 2,
      cutout: "70%",
      circumference: 360,
      rotation: -90,
      hoverOffset: 0,
      borderRadius: 2,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};
</script>

<template>
  <div class="relative w-[126px] h-[126px]">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div
      class="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-[#303133] text-center"
    >
      Общий<br />доход
    </div>
  </div>
</template>

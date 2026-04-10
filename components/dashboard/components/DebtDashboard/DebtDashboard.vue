<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import { Setting } from "@element-plus/icons-vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import dayjs from "dayjs";
import {
  formatCurrency,
} from "@/helpers/format.helpers";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Filler);

const emit = defineEmits(["open-modal"]);

const { DebtDashboard } = storeToRefs(useDashboardStore());

const openModal = () => {
  emit("open-modal", true);
};

const prepareData = computed(() => {
  if (!DebtDashboard.value?.stat) {
    return {
      labels: [],
      datasets: [],
    };
  }
  const data = DebtDashboard.value.stat;
  const labelsRaw = Object.keys(data).sort(
    (a, b) => dayjs(a).unix() - dayjs(b).unix()
  );
  const labels = labelsRaw.map((item) => [
    dayjs(item).format(`D MMMM`)
  ]);

  const dataset = labelsRaw.map((dateKey) => {
    return -Math.floor(Number(data[dateKey].total_debt));
  });

  const today = data[labelsRaw[labelsRaw.length - 1]];
  const yesterday = data[labelsRaw[labelsRaw.length - 2]];

  /* console.log("labels", labels);
  console.log("dataset", dataset);
  console.log('debt', data[labelsRaw[labelsRaw.length - 1]]) */

  return {
    labels,
    dataset,
    maxValue: Math.max(...dataset),
    minValue: Math.min(0, ...dataset),
    driversHasDebt: today?.drivers_has_debt,
    todayDeposit: today?.total_deposit,
    totalSum: Number(today?.total_debt) * -1,
    isUp: (today?.total_debt) > (yesterday?.total_debt),
  };
});

const chartData = computed(() => ({
  labels: prepareData.value.labels,
  datasets: [
    {
      data: prepareData.value.dataset,
      borderColor: "#A562FF",
      borderWidth: 3,
      fill: true,
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          context.chart.height
        );
        gradient.addColorStop(0, "rgba(165, 98, 255, 0.5)");
        gradient.addColorStop(1, "rgba(165, 98, 255, 0)");
        return gradient;
      },
      pointRadius: 1,
      pointHoverRadius: 5,
      tension: 0,
      clip: false,
    },
  ],
}));

const chartOptions = computed(() => {
  return {
    responsive: false,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function (tooltipItem: any) {
            const value = tooltipItem.raw;

            return `${value} ₽`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#E5E7EB",
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        position: "right",
        reverse: false,
        max: prepareData.value.maxValue,
        min: prepareData.value.minValue,
        grid: {
          drawTicks: true,
          color: "transparent",
          drawBorder: true,
        },
        ticks: {
          callback: function (value: any) {
            if (value >= 1_000_000 && value === prepareData.value.maxValue) {
              return Math.floor(value / 100_000) / 10 + "M ₽";
            }
            if (value >= 1_000 && value === prepareData.value.maxValue) {
              return Math.floor(value / 100) / 10 + "K ₽";
            }
            if (
              value <= 1_000 &&
              value === prepareData.value.minValue &&
              value !== 0
            ) {
              return Math.floor(value / 100) / 10 + "K ₽";
            }
            if (
              value <= 1_000_000 &&
              value === prepareData.value.minValue &&
              value !== 0
            ) {
              return Math.floor(value / 100_000) / 10 + "M ₽";
            }
            if (value === 0) return "0";
            /* return value + " ₽"; */
          },
          font: {
            size: 10,
          },
          padding: 5,
        },
      },
    },
  };
});
</script>

<template>
  <div
    class="w-[365px] flex flex-col bg-[#fff] rounded-tl-[24px] rounded-bl-[24px]"
  >
    <div class="flex flex-col px-6 pt-5 pb-[24px] justify-between h-full">
      <div class="flex items-center gap-2.5">
        <span class="text-[14px] font-medium">Общая задолженность</span>
        <el-link
          :icon="Setting"
          :underline="false"
          style="font-size: 16px"
          @click="openModal"
        />
      </div>
      <p class="flex text-[32px] font-medium gap-1 items-center">
        {{ formatCurrency(prepareData.totalSum) }}
        <span v-if="prepareData.isUp" class="text-[23px] text-red-500 leading-none">&#9650;</span>
        <span v-else class="text-[23px] text-green-500 leading-none">&#9660;</span>
      </p>
      <Line
        :data="chartData"
        :options="chartOptions"
        :width="323"
        :height="96"
      />
      <ul class="flex gap-1 items-baseline">
        <li
          class="flex flex-col text-xs w-1/2 bg-[#F5F5F5] px-3 py-2 rounded-tl-[8px] rounded-bl-[8px]"
        >
          <p>Водителей с долгом:</p>
          <p>{{ prepareData.driversHasDebt }}</p>
        </li>
        <li
          class="flex flex-col text-xs w-1/2 bg-[#F5F5F5] px-3 py-2 rounded-tr-[8px] rounded-br-[8px]"
        >
          <p>Оплачено за сегодня:</p>
          <p>{{ formatCurrency(prepareData.todayDeposit) }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

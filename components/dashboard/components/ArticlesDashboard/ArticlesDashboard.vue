<script setup>
import { Bar } from "vue-chartjs";
import {
  Chart,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";
import { computed } from "vue";
import dayjs from "dayjs";
import { formatCurrency } from "@/helpers/format.helpers";


const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

Chart.register(BarElement, LinearScale, CategoryScale, Tooltip);

const { DebtDashboard, dashBoardSettings } = storeToRefs(useDashboardStore());
const { balanceOperationsCategory, balanceOperationsCategoryColors } =
  useDashboardStore();

const prepareDataArticles = computed(() => {
  if (!DebtDashboard.value?.stat) {
    return {
      colors: [],
      dataset: [],
    };
  }
  const data = DebtDashboard.value.stat;
  const labelsRaw = Object.keys(data).sort(
    (a, b) => dayjs(a).unix() - dayjs(b).unix()
  );

  const today = data[labelsRaw[labelsRaw.length - 1]]?.by_categories;

  const dataset = [];
  const colors = [];

  /* for (let key in today) {
    dataset.push(Number(today[key].debt));
    colors.push(balanceOperationsCategoryColors[key]);
  } */

  dashBoardSettings.value.balanceOperations.forEach((key) => {
    if (!today) {
      dataset.push(0);
      colors.push(balanceOperationsCategoryColors[key]);
      return;
    }

    if (today[key]) {
      dataset.push(Number(today[key].debt));
    } else {
      dataset.push(0);
    }
    colors.push(balanceOperationsCategoryColors[key]);
  });

  return {
    dataset,
    colors,
    maxAbs: Math.max(
      Math.abs(Math.max(...dataset)),
      Math.abs(Math.min(...dataset))
    ),
    today,
  };
});

const chartData = computed(() => ({
  labels: Array(prepareDataArticles.value.dataset.length).fill(""),
  datasets: [
    {
      data: prepareDataArticles.value.dataset,
      backgroundColor: prepareDataArticles.value.colors,
      borderRadius: 2,
      barPercentage: 1,
      categoryPercentage: 1,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: false,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (tooltipItem) {
          const value = tooltipItem.raw;

          return `${-value} ₽`;
        },
      },
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      min: -prepareDataArticles.value.maxAbs,
      max: prepareDataArticles.value.maxAbs,
      reverse: true,
      grid: {
        drawBorder: false,
        drawTicks: false,
        color: function (ctx) {
          return ctx.tick.value === 0 ? "#ccc" : "transparent";
        },
        lineWidth: 1,
      },
      ticks: {
        color: "#909399",
        callback: function (value) {
          if (value === prepareDataArticles.value.maxAbs) return "-";
          if (value === 0) return "0";
          if (value === -prepareDataArticles.value.maxAbs) return "+";
          return "";
        },
        padding: 10,
        font: {
          size: 12,
          weight: "bold",
        },
      },
      border: {
        display: false,
      },
    },
  },
}));
</script>

<template>
  <div class="w-[238px] flex flex-col bg-[#fff]">
    <div class="flex flex-col px-6 pt-5 pb-[9px] gap-5">
      <div class="flex items-center justify-between gap-2.5">
        <span class="text-[14px] font-medium">По статьям</span>
      </div>
      <div class="bg-[#F5F5F5] rounded-[8px]">
        <Bar
          :data="chartData"
          :options="chartOptions"
          :width="160"
          :height="112"
        />
      </div>
    </div>
    <ul
      class="custom-scroll flex-col flex pl-6 mr-[4px] gap-1 items-baseline overflow-y-auto max-h-[215px]"
    >
      <!-- <li
        v-for="(operation, key) in prepareDataArticles.today"
        :key="key"
        class="flex items-center gap-2"
      >
        <div
          :class="`w-[6px] h-[6px] rounded-[2px] bg-[${balanceOperationsCategoryColors[key]}]`"
          :style="{ backgroundColor: balanceOperationsCategoryColors[key] }"
        ></div>
        <p class="text-[#909399] text-xs">
          {{ balanceOperationsCategory[key] }}
          {{ formatCurrency(operation.debt * -1) }}
        </p>
      </li> -->
      <li
        v-for="(operation, key) in dashBoardSettings?.balanceOperations"
        :key="key"
        class="flex items-center gap-2"
      >
        <div
          :class="`w-[6px] h-[6px] rounded-[2px] bg-[${balanceOperationsCategoryColors[operation]}]`"
          :style="{ backgroundColor: balanceOperationsCategoryColors[operation] }"
        ></div>
        <p class="text-[#909399] text-xs">
          {{ balanceOperationsCategory[operation] }}
          {{ prepareDataArticles.today ? formatCurrency((prepareDataArticles?.today[operation]?.debt ?? 0) * -1) : `0 ${userProfileLocalCurrencySymbol}`}}
        </p>
      </li>
    </ul>
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

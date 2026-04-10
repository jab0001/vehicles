<script setup lang="ts">
import { useRouter } from "vue-router";

import dayjs from "dayjs";

import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

import IncomeDashboard from "@/components/dashboard/components/IncomeDashboard/IncomeDashboard.vue";
import InspectionsDashboard from "@/components/dashboard/components/InspectionsDashboard/InspectionsDashboard.vue";
import FinesDashboard from "@/components/dashboard/components/FinesDashboard/FinesDashboard.vue";
import DebtDashboard from "@/components/dashboard/components/DebtDashboard/DebtDashboard.vue";
import VehiclesDashboard from "@/components/dashboard/components/VehiclesDashboard/VehiclesDashboard.vue";
import DriversDashboard from "@/components/dashboard/components/DriversDashboard/DriversDashboard.vue";
import ArticlesDashboard from "@/components/dashboard/components/ArticlesDashboard/ArticlesDashboard.vue";
import VehiclesInfoDashboard from "@/components/dashboard/components/VehiclesInfoDashboard/VehiclesInfoDashboard.vue";
import { useDashboardStore } from "@/stores/dashboardStore";

const router = useRouter();
const emit = defineEmits(["open-modal", "open-statistic-modal"]);
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
const {
  fetchInspectionsDashboard,
  fetchDiagnosticDashboard,
  fetchFinesDashboard,
  fetchDebtDashboard,
  fetchDriverDebtDashboard,
  fetchDiagnosticCountDashboard,
  fetchInsurancesDashboard,
  fetchFinanceDashboardStats,
  fetchInsuranceDashboardStatistics,
} = useDashboardStore();
const height = window.innerHeight;

const {
  fetchDebtDashboardLoading,
  fetchFinesDashboardLoading,
  fetchFinanceDashboardLoading,
  dashBoardSettings,
  dashBoardInsuranceStatisticSettings,
} = storeToRefs(useDashboardStore());

watch(
  () => dashBoardSettings,
  (newVal) => {
    fetchDebtDashboard({
      date_from: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
      categories: [...dashBoardSettings.value?.balanceOperations],
      only_debt_included: dashBoardSettings.value?.onlyDebtIncluded,
    });
  },
  { deep: true, immediate: true },
);

watch(
  dashBoardInsuranceStatisticSettings.value,
  (newVal) => {
    fetchInsuranceDashboardStatistics(dashBoardInsuranceStatisticSettings.value);
  },
  { deep: true, immediate: true },
);

const openModal = (isDebt: boolean) => {
  emit("open-modal", isDebt);
};

const openStatisticModal = () => {
  emit("open-statistic-modal")
};

onMounted(async () => {
  fetchFinanceDashboardStats();
  fetchFinesDashboard();
  fetchInsurancesDashboard();
  /* fetchDebtDashboard({
    date_from: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    categories: [],
  }); */
  fetchDriverDebtDashboard({});
  fetchInspectionsDashboard({
    company_id: currentCompanyId.value,
  });
  fetchDiagnosticDashboard();
  fetchDiagnosticCountDashboard();
});
</script>

<template>
  <div
    :class="[
      'w-[1172px] relative mx-auto flex flex-col gap-2.5',
      height < 900 ? 'pb-[220px]' : '',
    ]"
  >
    <section class="flex">
      <div
        class="h-[166px] flex w-full justify-between rounded-[24px] bg-[#fff]"
      >
        <IncomeDashboard v-loading="fetchFinanceDashboardLoading" />
      </div>
    </section>
    <section class="flex">
      <div class="h-[298px] flex w-full justify-between rounded-[24px]">
        <DebtDashboard
          v-loading="fetchDebtDashboardLoading"
          @open-modal="openModal"
        />
        <ArticlesDashboard />
        <DriversDashboard @open-modal="openModal" />
      </div>
    </section>
    <section class="flex-1 flex flex-col gap-2.5">
      <div class="h-[298px] flex justify-between">
        <FinesDashboard v-loading="fetchFinesDashboardLoading" />
        <InspectionsDashboard />
        <VehiclesDashboard @open-statistic-modal="openStatisticModal"/>
      </div>
    </section>
    <section class="flex-1 flex flex-col gap-2.5">
      <div class="h-[90px] flex justify-between">
        <VehiclesInfoDashboard />
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.statuses .el-table tr) {
  background: transparent;
}
:deep(.statuses .el-table) {
  background: transparent;
}
:deep(.el-link__inner) {
  @apply text-xs font-medium;
}

:deep(.el-loading-mask) {
  border-radius: 24px;
}
</style>

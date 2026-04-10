<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from "vue";
import DashboardVehicleInsuranceTab from "./Tabs/DashboardVehicleInsuranceTab.vue";
import DashboardVehicleDiagnosticsTab from "./Tabs/DashboardVehicleDiagnosticsTab.vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";
import { Setting } from "@element-plus/icons-vue";

const {
  fetchDiagnosticCountDashboardLoading,
  DiagnosticCountDashboard,
  insuranceDashboardStatisticsLoading,
  insuranceDashboardStatisticsResponse,
} = storeToRefs(useDashboardStore());

const emit = defineEmits(["open-statistic-modal"]);

const statisticCounts = computed(() => {
  const [current = {}, prev = {}] = Array.isArray(
    DiagnosticCountDashboard.value,
  )
    ? DiagnosticCountDashboard.value
    : [];

  return {
    expired: current[`expired_diagnostic_cards`],
    prev_expired: prev[`expired_diagnostic_cards`],
    expiring_soon: current[`expiring_soon_diagnostic_cards`],
    prev_expiring_soon: prev[`expiring_soon_diagnostic_cards`],
    valid: current[`valid_diagnostic_cards`],
    prev_valid: prev[`valid_diagnostic_cards`],
  };
});

const tabs = ref([
  {
    label: "Страхование",
    name: "dashboard-insurance",
    component: markRaw(DashboardVehicleInsuranceTab),
  },
  {
    label: "Диагност. карты",
    name: "dashboard-diagnostics",
    component: markRaw(DashboardVehicleDiagnosticsTab),
  },
]);

const activeTab = ref(tabs.value[0].name);

const handleRowClicked = () => {
  activeTab.value = tabs.value[1].name;
};

const openStatisticModal = () => {
  emit("open-statistic-modal")
};
</script>

<template>
  <div class="w-[494px] rounded-[24px] bg-[#fff] flex">
    <div class="w-[350px]">
      <div class="flex items-center px-6 py-4 border-b border-[#EBEEF5]">
        <div class="flex w-full">
          <span class="text-[14px] font-medium">А/м</span>
          <div class="ml-auto">
            <el-tabs
              class="w-full"
              ref="tabsRef"
              v-model="activeTab"
              type="card"
              stretch
              ><el-tab-pane
                v-for="tab in tabs"
                :key="tab.name"
                :label="tab.label"
                :name="tab.name"
            /></el-tabs>
          </div>
        </div>
      </div>

      <div class="pl-6 pr-[4px] py-[14px]">
        <component
          v-for="item in tabs"
          :is="item.component"
          v-show="item.name === activeTab"
          @row-clicked="handleRowClicked"
        />
      </div>
    </div>
    <div
      class="w-[143px] border-l border-[#EBEEF5]"
      v-loading="
        insuranceDashboardStatisticsLoading ||
        fetchDiagnosticCountDashboardLoading
      "
    >
      <div
        class="flex flex-col items-center px-5 py-4 gap-5"
        v-if="activeTab === 'dashboard-diagnostics'"
      >
        <span class="text-[14px] font-medium">Статистика</span>
        <ul class="flex flex-col gap-[2px]">
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#FFD5D0] flex flex-col justify-center rounded-tl-[12px] rounded-tr-[12px]"
          >
            <p class="text-xs font-medium text-[#FD503D]">Просрочено</p>
            <p class="text-[18px] font-medium text-[#FD503D]">
              {{ statisticCounts.expired }}
              <span class="text-xs font-medium">{{
                statisticCounts.expired - statisticCounts.prev_expired > 0
                  ? "+" +
                    (statisticCounts.expired - statisticCounts.prev_expired)
                  : statisticCounts.expired - statisticCounts.prev_expired
              }}</span>
            </p>
          </li>
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#FFECD7] flex flex-col justify-center"
          >
            <p class="text-xs font-medium text-[#FF8D14]">Истекают</p>
            <p class="text-[18px] font-medium text-[#FF8D14]">
              {{ statisticCounts.expiring_soon }}
              <span class="text-xs font-medium">{{
                statisticCounts.expiring_soon -
                  statisticCounts.prev_expiring_soon >
                0
                  ? "+" +
                    (statisticCounts.expiring_soon -
                      statisticCounts.prev_expiring_soon)
                  : statisticCounts.expiring_soon -
                    statisticCounts.prev_expiring_soon
              }}</span>
            </p>
          </li>
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#D7F0D9] flex flex-col justify-center rounded-bl-[12px] rounded-br-[12px]"
          >
            <p class="text-xs font-medium text-[#4EB756]">Действующие</p>
            <p class="text-[18px] font-medium text-[#4EB756]">
              {{ statisticCounts.valid }}
              <span class="text-xs font-medium">{{
                statisticCounts.valid - statisticCounts.prev_valid > 0
                  ? "+" + (statisticCounts.valid - statisticCounts.prev_valid)
                  : statisticCounts.valid - statisticCounts.prev_valid
              }}</span>
            </p>
          </li>
          <!-- <li class="py-[10px] px-3">
            <p class="text-xs font-medium">Общее количество</p>
            <p class="text-[18px] font-medium">
              {{
                statisticCounts.valid +
                statisticCounts.expiring_soon +
                statisticCounts.expired
              }}
            </p>
          </li> -->
        </ul>
      </div>
      <div
        class="flex flex-col items-center px-5 py-4 gap-5"
        v-if="activeTab === 'dashboard-insurance'"
      >
        <span class="text-[14px] font-medium flex items-center"
          >Статистика<el-link
            :icon="Setting"
            :underline="false"
            style="font-size: 16px; margin-left: 5px"
            @click="openStatisticModal"
        /></span>

        <ul class="flex flex-col gap-[2px]">
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#FFD5D0] flex flex-col justify-center rounded-tl-[12px] rounded-tr-[12px]"
          >
            <p class="text-xs font-medium text-[#FD503D]">Без страховки</p>
            <p class="text-[18px] font-medium text-[#FD503D]">
              {{ insuranceDashboardStatisticsResponse?.wo_insurance ?? "-" }}
            </p>
          </li>
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#FFECD7] flex flex-col justify-center"
          >
            <p class="text-xs font-medium text-[#FF8D14]">Истекают</p>
            <p class="text-[18px] font-medium text-[#FF8D14]">
              {{ insuranceDashboardStatisticsResponse?.expires_soon ?? "-" }}
            </p>
          </li>
          <li
            class="py-[10px] px-3 min-h-[70px] bg-[#D7F0D9] flex flex-col justify-center rounded-bl-[12px] rounded-br-[12px]"
          >
            <p class="text-xs font-medium text-[#4EB756]">Действующие</p>
            <p class="text-[18px] font-medium text-[#4EB756]">
              {{ insuranceDashboardStatisticsResponse?.active ?? "-" }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-tabs__header) {
  margin: 0;
  height: 24px;
}

:deep(.el-tabs__nav-wrap) {
  margin: 0;
}

:deep(.el-tabs__item) {
  padding: 0 !important;
  width: 125.5px;
  font-size: 13px;
  height: 24px;
  &.is-active {
    background: rgba(165, 98, 255, 0.15);
    color: #a562ff;
    border: none !important;
  }

  &:hover {
    color: #a562ff;
  }
}

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

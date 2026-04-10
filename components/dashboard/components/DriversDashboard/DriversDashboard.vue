<script setup lang="ts">
import { computed, markRaw, ref, watch } from "vue";
import DashboardDriverDebtTab from "./Tabs/DashboardDriverDebtTab.vue";
import DashboardDriverOperatinTab from "./Tabs/DashboardDriverOperationTab.vue";
import { Setting } from "@element-plus/icons-vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";

const emit = defineEmits(["open-modal"]);

const { dashBoardDriverSettings } = storeToRefs(useDashboardStore());

const { balanceOperationsCategory, fetchDriverDebtDashboard } =
  useDashboardStore();

const tabs = computed(() => {
  const choosedTabs = dashBoardDriverSettings.value.balanceOperations.map(
    (item) => {
      const key = item as keyof typeof balanceOperationsCategory;
      return {
        label: balanceOperationsCategory[key],
        name: key,
        component: markRaw(DashboardDriverOperatinTab),
      };
    }
  );

  return [
    {
      label: "Общий долг",
      name: "dashboard-debt",
      component: markRaw(DashboardDriverDebtTab),
    },
    ...choosedTabs,
  ];
});

const activeTab = ref(tabs.value[0].name);

watch(
  [activeTab, () => dashBoardDriverSettings.value?.onlyDebtIncluded],
  ([tab, onlyDebtIncluded]) => {
    const isDebtTab = tab === "dashboard-debt";

    fetchDriverDebtDashboard({
      categories: isDebtTab ? [] : [tab],
      only_debt_included: onlyDebtIncluded,
    });
  }
);

watch(
  () => dashBoardDriverSettings.value?.balanceOperations,
  (newVal) => {
    activeTab.value = tabs.value[0].name;
  }
);

const handleRowClicked = () => {
  activeTab.value = tabs.value[1].name;
};

const openModal = () => {
  emit("open-modal", false);
};
</script>

<template>
  <div
    class="w-[559px] flex flex-col bg-[#fff] rounded-tr-[24px] rounded-br-[24px]"
  >
    <div
      class="flex items-center justify-between gap-1 px-6 py-4 pb-[13px] border-b-[1px]"
    >
      <div class="flex items-center gap-2">
        <span class="text-[14px] font-medium">Водители</span>
        <el-link
          :icon="Setting"
          :underline="false"
          style="font-size: 16px"
          @click="openModal"
        />
      </div>
      <div class="">
        <el-tabs
          class="w-[408px]"
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
    <component
      v-for="item in tabs"
      :is="item.component"
      :key="item.name"
      :active-tab="activeTab"
      v-show="item.name === activeTab"
      @row-clicked="handleRowClicked"
    />
  </div>
</template>

<style scoped>
:deep(.el-tabs__header) {
  margin: 0;
  height: 24px;
  border-bottom: none;
}

:deep(.el-tabs__nav-wrap) {
  margin: 0;
}

:deep(.el-tabs__item) {
  padding: 0 !important;
  padding: 0 15px !important;
  /* min-width: 101.5px; */
  font-size: 13px;
  height: 24px;
  border-bottom: 1px solid #e4e7ed !important;
  &.is-active {
    background: rgba(165, 98, 255, 0.15);
    color: #a562ff;
    border: none !important;
  }

  &:hover {
    color: #a562ff;
  }
}

:deep(.el-tabs__nav-next) {
  line-height: 24px !important;
}
:deep(.el-tabs__nav-prev) {
  line-height: 24px !important;
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

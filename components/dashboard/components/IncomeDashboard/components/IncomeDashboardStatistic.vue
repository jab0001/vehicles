<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, reactive, ref, watch } from "vue";
import { formatDateToServer } from "@/helpers/format.helpers";
import { useHelpers } from "@/composables/useHelpers";
import { formatCurrency } from "@/helpers/format.helpers";

import IncomeDasboardStaticBlock from "@/components/dashboard/components/IncomeDashboard/components/IncomeDashboardStatisticBlock.vue";
import { useDashboardStore } from "@/stores/dashboardStore";

const { dateKeydownMask } = useHelpers();
const { fetchFinanceDashboardStats } = useDashboardStore();
const { dashboardFinanceStats } = storeToRefs(useDashboardStore());

const emit = defineEmits<{
  (e: "changeSelected", v: string): void;
}>();

const props = defineProps<{
  headerData: {
    title: string;
    sum: number;
    name: string;
  }[];
  currentSelect: string;
}>();

const pageFilters = reactive<{
  datetime_start: string | undefined;
  datetime_end: string | undefined;
}>({
  datetime_start: undefined,
  datetime_end: undefined,
});
const daterange = ref("");
const selected = ref(props.currentSelect);

const operationSum = computed(() => {
  return props.currentSelect === "accrual"
    ? props.headerData[0].sum
    : props.headerData[1].sum;
});

watch(selected, (v) => {
  if (v) {
    emit("changeSelected", selected.value);
  }
});

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.datetime_start = formatDateToServer(v[0]);
    pageFilters.datetime_end = formatDateToServer(v[1]);
  } else {
    pageFilters.datetime_start = undefined;
    pageFilters.datetime_end = undefined;
  }
});

watch(pageFilters, (v) => {
  if (v) {
    fetchFinanceDashboardStats(
      pageFilters.datetime_start,
      pageFilters.datetime_end
    );
  }
});
</script>

<template>
  <div class="w-full">
    <div class="flex w-full justify-between">
      <p class="flex text-[32px] font-medium leading-none grow">
        {{ formatCurrency(operationSum) ?? 0 }}
      </p>

      <div class="item-center mr-[110px]">
        <el-tabs class="w-full" ref="tabsRef" v-model="selected" type="card"
          ><el-tab-pane
            v-for="tab in props.headerData"
            :key="tab.name"
            :label="tab.title"
            :name="tab.name"
        /></el-tabs>
      </div>

      <el-date-picker
        :clearable="true"
        v-model="daterange"
        class="max-w-[266px]"
        type="daterange"
        start-placeholder="Начало"
        end-placeholder="Конец"
        value-format="YYYY-MM-DD"
        format="DD.MM.YYYY"
        @keydown="dateKeydownMask"
      >
        <template #range-separator>до</template>
      </el-date-picker>
    </div>
    <ul class="grid grid-cols-3 gap-4 mt-4">
      <li v-for="(block, index) in dashboardFinanceStats" :key="index">
        <IncomeDasboardStaticBlock
          :block="block"
          :currentSelect="props.currentSelect"
          :totalOperationSum="operationSum"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
:deep(.el-tabs__header) {
  margin: 0;
  height: 32px;
}

:deep(.el-tabs__nav-wrap) {
  margin: 0;
}

:deep(.el-tabs__item) {
  padding: 0 !important;
  width: 125.5px;
  font-size: 13px;
  height: 32px;
  &.is-active {
    background: rgba(165, 98, 255, 0.15);
    color: #a562ff;
    /* border: none !important; */
  }

  &:hover {
    color: #a562ff;
  }
}

/* .custom-scroll::-webkit-scrollbar {
  width: 4px;
} */

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

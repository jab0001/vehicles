<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElNotification } from "element-plus";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import UiSearch from "@/components/ui/UiSearch.vue";
import TableAdjustmentsApplications from "@/components/tables/TableAdjustmentsApplications.vue";

import { useAppStore } from "@/stores/appStore";
import { useAdjustmentsApplicationsStore } from "@/stores/adjustmentsApplicationsStore";
import { useHelpers } from "@/composables/useHelpers";
import type { IAdjustmentsApplication } from "@/types/adjustmentsApplications";

const isMounted = useMounted();
const {
  setAdjustmentsApplicationsCreateHash,
  setAdjustmentsApplicationsDetailsHash,
} = useAppStore();
const { initialAdjustmentParams, fetchAdjustmentsList } =
  useAdjustmentsApplicationsStore();
const {
  adjustmentsListTotalItems,
  adjustmenstList,
  adjustmentsListLoading,
  newAdjustment,
  updateAdjustmentResponse,
  updateAdjustmentStatusResponse,
} = storeToRefs(useAdjustmentsApplicationsStore());
const { dateKeydownMask } = useHelpers();
const daterange = ref([]);
const pageFilters = ref({
  ...initialAdjustmentParams,
});

watch(
  [
    pageFilters,
    newAdjustment,
    updateAdjustmentResponse,
    updateAdjustmentStatusResponse,
  ],
  ([filtersV, newAdjV, updateV, newStatusV]) => {
    if (filtersV || newAdjV || updateV || newStatusV) {
      console.log("here");

      fetchAdjustmentsList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.start_date = v[0];
    pageFilters.value.end_date = v[1];
  } else {
    pageFilters.value.start_date = undefined;
    pageFilters.value.end_date = undefined;
  }
});

const onRowClick = (rowItem: IAdjustmentsApplication) => {
  setAdjustmentsApplicationsDetailsHash(rowItem.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialAdjustmentParams,
  };
  daterange.value = [];
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex items-center justify-between w-full gap-2">
      <div class="text-md text-nowrap text-lg">
        {{ "Заявления на корректировку начислений" }}
      </div>
      <div class="flex items-center gap-3">
        <UiSearch
          v-model="pageFilters.search"
          class="max-w-[175px]"
          placeholder="Выберите водителя"
        />
        <el-date-picker
          :clearable="false"
          v-model="daterange"
          class="max-w-[340px]"
          type="daterange"
          start-placeholder="Начало"
          end-placeholder="Конец"
          value-format="YYYY-MM-DD"
          format="DD.MM.YYYY"
          @keydown="dateKeydownMask"
        >
          <template #range-separator>до</template>
        </el-date-picker>
        <el-link :underline="false" @click="clearFilters" class="w-fit whitespace-nowrap">Сбросить всё</el-link>
      </div>
      <el-button @click="setAdjustmentsApplicationsCreateHash" type="primary">{{
        $t("views.drivers.btnAdd")
      }}</el-button>
    </div>
  </Teleport>

  <TableAdjustmentsApplications
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="adjustmentsListLoading"
    :display-columns="[]"
    :sortable-columns="[]"
    :items="adjustmenstList"
    :totalItems="adjustmentsListTotalItems"
    :loading="adjustmentsListLoading"
    empty-text="Заявления не найдены"
    :rowClassName="'cursor-pointer'"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

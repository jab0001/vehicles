<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useStocksMovingStore } from "@/stores/stocksStore";
import { useHelpers } from "@/composables/useHelpers";
import { formatDateToServer } from "@/helpers/format.helpers";

import type { IStockOperation } from "@/types/stocks";

import TableStocksMoving from "@/components/tables/TableStocksMoving.vue";

const isMounted = useMounted();
const { fetchMovingList, initialMovingParams } = useStocksMovingStore();
const { movingLoading, movingList, movingListTotalItems, newMovingOperation } =
  storeToRefs(useStocksMovingStore());
const { setStocksMovingCreateHash, setStocksMovingDetailsHash } = useAppStore();
const { dateKeydownMask } = useHelpers();
const daterange = ref("");
const pageFilters = ref({
  ...initialMovingParams,
});

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.datetime_from = formatDateToServer(v[0]);
    pageFilters.value.datetime_to = formatDateToServer(v[1]);
  } else {
    pageFilters.value.datetime_from = undefined;
    pageFilters.value.datetime_to = undefined;
  }
});
watch(
  [pageFilters, newMovingOperation],
  ([filtersV, newV]) => {
    if (filtersV || newV) {
      fetchMovingList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: IStockOperation) => {
  setStocksMovingDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialMovingParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Перемещение товаров</div>

    <div class="flex items-center gap-3">
      <el-date-picker
        :clearable="false"
        v-model="daterange"
        class="w-[340px]"
        type="daterange"
        start-placeholder="Начало"
        end-placeholder="Конец"
        value-format="YYYY-MM-DD"
        format="DD.MM.YYYY"
        @keydown="dateKeydownMask"
      >
        <template #range-separator>до</template>
      </el-date-picker>
      <el-link :underline="false" @click="clearFilters"> Сбросить всё </el-link>
    </div>

    <el-button @click="setStocksMovingCreateHash" type="primary">
      Переместить товары
    </el-button>
  </Teleport>

  <TableStocksMoving
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="movingLoading"
    :items="movingList"
    :totalItems="movingListTotalItems"
    :empty-text="
      daterange.length
        ? 'В этот период перемещений не проводились'
        : 'Перемещения не производились'
    "
    :rowClassName="'cursor-pointer'"
    :loading="movingLoading"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

<style scoped></style>

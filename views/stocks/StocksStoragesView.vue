<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch, computed } from "vue";
import { useMounted } from "@vueuse/core";

import { useStocksStore } from "@/stores/stocksStore";
import { useAppStore } from "@/stores/appStore";

import type { IStock } from "@/types/stocks";

import TableStocksStorages from "@/components/tables/TableStocksStorages.vue";
import UiSearch from "@/components/ui/UiSearch.vue";

const isMounted = useMounted();
const { fetchStocksList, initialStocksParams } = useStocksStore();
const {
  stocksListTotalItems,
  stocksListLoading,
  stocksList,
  newStock,
  updateStockResponse,
} = storeToRefs(useStocksStore());
const { setStocksCreateHash, setStocksDetailsHash } = useAppStore();
const pageFilters = ref({
  ...initialStocksParams,
});

watch(
  [pageFilters, newStock, updateStockResponse],
  ([filtersV, newStockV, updateV]) => {
    if (filtersV || newStockV || updateV) {
      fetchStocksList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: IStock) => setStocksDetailsHash(rowItem.id);
const clearFilters = () => {
  pageFilters.value = {
    ...initialStocksParams,
  };
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Места хранения" }}
      </div>

      <div class="flex items-center gap-3">
        <UiSearch
          v-model="pageFilters.search"
          class="w-56"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>

      <el-button type="primary" @click="setStocksCreateHash">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <TableStocksStorages
    v-model:pagination="pageFilters"
    v-loading="stocksListLoading"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="stocksList"
    :totalItems="stocksListTotalItems"
    :empty-text="'Места хранения не добавлены'"
    :rowClassName="'cursor-pointer'"
    :loading="stocksListLoading"
    border
    @row-click="onRowClick"
  />
</template>

<style scoped></style>

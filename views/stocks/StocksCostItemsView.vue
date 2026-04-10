<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ref, watch, computed } from "vue";

import { useAppStore } from "@/stores/appStore";
import { useStocksCostItemsStore } from "@/stores/stocksStore";

import type { IStockCostItem } from "@/types/stocks";

import UiSearch from "@/components/ui/UiSearch.vue";
import TableStocksCostItems from "@/components/tables/TableStocksCostItems.vue";

const isMounted = useMounted();
const { setStocksCostItemsHash, setStocksCostItemDetailsHash } = useAppStore();
const { fetchCostItemsList, initialCostItemsListParams } =
  useStocksCostItemsStore();
const {
  costItemsListLoading,
  costItemsList,
  costItemsListTotalItems,
  newCostItem,
  updateCostItemResponse,
} = storeToRefs(useStocksCostItemsStore());

const pageFilters = ref({
  ...initialCostItemsListParams,
});

watch(
  [pageFilters, newCostItem, updateCostItemResponse],
  ([filtersV, newV, updateV]) => {
    if (filtersV || newV || updateV) {
      fetchCostItemsList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: IStockCostItem) => {
  setStocksCostItemDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialCostItemsListParams,
  };
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Статьи затрат</div>

    <div class="flex items-center gap-3">
      <UiSearch class="w-56" placeholder="Поиск по наименованию" />
      <el-link :underline="false" @click="clearFilters"> Сбросить всё </el-link>
    </div>

    <el-button @click="setStocksCostItemsHash" type="primary">
      Добавить статью
    </el-button>
  </Teleport>

  <TableStocksCostItems
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="costItemsListLoading"
    :items="costItemsList"
    :loading="costItemsListLoading"
    :total-items="costItemsListTotalItems"
    :empty-text="
      pageFilters.search ? 'Ничего не найдено' : 'Статьи не добавлены'
    "
    :rowClassName="'cursor-pointer'"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

<style scoped></style>

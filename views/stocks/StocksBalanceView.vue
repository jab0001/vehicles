<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStocksBalance } from "@/composables/useStocks";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableStocksBalance from "@/components/tables/TableStocksBalance.vue";
import AutocompleteStockStorageMulti from "@/components/autocomplete/AutocompleteStockStorageMulti.vue";

const {
  initialBalanceListParams,
  balanceList,
  balanceListTotalItems,
  balanceListLoading,
  fetchBalanceList,
  balanceListResponse
} = useStocksBalance();
const pageFilters = ref({
  ...initialBalanceListParams,
});
const searchStock = ref([]);

const visibleItems = computed(() => {
  /* return pageFilters.value.stock_id?.length ? balanceList.value?.filter((item) => item?.items?.length) : []; */
  return pageFilters.value.stock_id?.length ? balanceList.value : [];
});

watch(
  pageFilters,
  (v) => {
    if (!v.stock_id?.length) return;
    fetchBalanceList(v);
  },
  {
    immediate: true,
    deep: true,
  }
);
watch(searchStock, (v) => {
  if (!v) pageFilters.value.stock_id = undefined;
});

const handleStockSelect = (items: any) => {
  const ids = items.map((s: any) => s.id);
  pageFilters.value.stock_id = ids;
};

const clearFilters = () => {
  pageFilters.value = {
    ...initialBalanceListParams,
  };
  searchStock.value = [];
  balanceListResponse.value = undefined;
};
</script>

<template>
  <Teleport defer to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-lg text-nowrap pr-2">
        {{ "Остатки" }}
      </div>

      <!-- <div class="flex items-center "> -->
        <AutocompleteStockStorageMulti
          v-model="searchStock"
          :placeholder="'Выберите склад'"
          clearable
          
          @handle-select="handleStockSelect"
          @clear="clearFilters"
        />
        <!-- <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        /> -->
        <el-link class="shrink-0" :underline="false" @click="clearFilters"
          >Сбросить всё</el-link
        >
      <!-- </div> -->

    </div>
  </Teleport>

  <TableStocksBalance
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="balanceListLoading"
    :items="visibleItems"
    :totalItems="balanceListTotalItems"
    :empty-text="pageFilters.search ? 'Ничего не найдено' : 'Нет остатков'"
    :loading="balanceListLoading"
    border
  />
</template>

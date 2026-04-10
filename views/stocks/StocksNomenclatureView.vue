<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useStocksNomenclatureStore } from "@/stores/stocksStore";

import type { INomenclature } from "@/types/stocks";

import UiSearch from "@/components/ui/UiSearch.vue";
import TableStocksNomenclature from "@/components/tables/TableStocksNomenclature.vue";

const isMounted = useMounted();
const { setStocksNomenclatureCreateHash, setStocksNomenclatureDetailsHash } =
  useAppStore();
const {
  fetchNomenclatureGroups,
  fetchnomenclatureList,
  initialNomenclatureParams,
} = useStocksNomenclatureStore();
const {
  nomenclatureListLoading,
  nomenclatureList,
  nomenclatureListTotalItems,
  newNomenclature,
  updateNomenclatureResponse,
} = storeToRefs(useStocksNomenclatureStore());

const pageFilters = ref({
  ...initialNomenclatureParams,
});

watch(
  [pageFilters, newNomenclature, updateNomenclatureResponse],
  ([filtersV, newNomenclature, updateV]) => {
    if (filtersV || newNomenclature || updateV) {
      fetchnomenclatureList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: INomenclature) => {
  setStocksNomenclatureDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialNomenclatureParams,
  };
};
fetchNomenclatureGroups();
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Номенклатура</div>

    <div class="flex items-center gap-3">
      <UiSearch
        v-model="pageFilters.search"
        class="w-72"
        placeholder="Поиск по наименованию и группе"
      />
      <el-link :underline="false" @click="clearFilters"> Сбросить всё </el-link>
    </div>

    <el-button @click="setStocksNomenclatureCreateHash" type="primary">
      Добавить
    </el-button>
  </Teleport>

  <TableStocksNomenclature
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="nomenclatureListLoading"
    :display-columns="['id', 'name', 'group_name', 'article', 'type', 'unit']"
    :items="nomenclatureList"
    :loading="nomenclatureListLoading"
    :total-items="nomenclatureListTotalItems"
    :empty-text="
      pageFilters.search ? 'Ничего не найдено' : 'Номенклатура не добавлена'
    "
    :rowClassName="'cursor-pointer'"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

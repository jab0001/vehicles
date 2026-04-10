<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useStocksWriteOffStore } from "@/stores/stocksStore";
import { useHelpers } from "@/composables/useHelpers";
import { formatDateToServer } from "@/helpers/format.helpers";

import TableStocksWriteOff from "@/components/tables/TableStocksWriteOff.vue";

const { setStocksWriteOffHash, setStocksWriteOffDetailsHash } = useAppStore();
const { fetchWriteOffList, initialWriteOffParams } = useStocksWriteOffStore();
const {
  writeOffLoading,
  writeOffList,
  writeOffListTotalItems,
  newWriteOffOperation,
} = storeToRefs(useStocksWriteOffStore());
const { dateKeydownMask } = useHelpers();
const isMounted = useMounted();

const daterange = ref("");
const pageFilters = ref({
  ...initialWriteOffParams,
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
  [pageFilters, newWriteOffOperation],
  ([filtersV, newV]) => {
    if (filtersV || newV) {
      fetchWriteOffList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: any) => {
  setStocksWriteOffDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialWriteOffParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Списание товаров</div>

    <div class="flex items-center gap-3">
      <el-date-picker :clearable="false"
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

    <el-button @click="setStocksWriteOffHash" type="primary">
      Добавить реализацию
    </el-button>
  </Teleport>

  <TableStocksWriteOff
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="writeOffLoading"
    :items="writeOffList"
    :totalItems="writeOffListTotalItems"
    :empty-text="
      daterange.length
        ? 'В этот период ничего не было списано'
        : 'Списания не производились'
    "
    :rowClassName="'cursor-pointer'"
    :loading="writeOffLoading"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

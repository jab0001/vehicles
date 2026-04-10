<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useStocksPostingStore } from "@/stores/stocksStore";
import { useHelpers } from "@/composables/useHelpers";
import { formatDateToServer } from "@/helpers/format.helpers";

import TableStocksPosting from "@/components/tables/TableStocksPosting.vue";

const { setStocksPostingHash, setStocksPostingDetailsHash } = useAppStore();
const { fetchPostingList, initialPostingParams } = useStocksPostingStore();
const {
  postingLoading,
  postingList,
  postingListTotalItems,
  newPostingOperation,
} = storeToRefs(useStocksPostingStore());
const { dateKeydownMask } = useHelpers();
const isMounted = useMounted();

const daterange = ref("");
const pageFilters = ref({
  ...initialPostingParams,
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
  [pageFilters, newPostingOperation],
  ([filtersV, newV]) => {
    if (filtersV || newV) {
      fetchPostingList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: any) => {
  setStocksPostingDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialPostingParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Оприходование товаров</div>

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

    <el-button @click="setStocksPostingHash" type="primary">
      Оприходовать товары
    </el-button>
  </Teleport>

  <TableStocksPosting
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="postingLoading"
    :items="postingList"
    :totalItems="postingListTotalItems"
    :empty-text="
      daterange.length
        ? 'В этот период не было оприходований'
        : 'Оприходования не производились'
    "
    :rowClassName="'cursor-pointer'"
    :loading="postingLoading"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

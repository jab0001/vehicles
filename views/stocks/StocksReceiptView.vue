<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useStocksReceiptStore } from "@/stores/stocksStore";
import { useHelpers } from "@/composables/useHelpers";
import { formatDateToServer } from "@/helpers/format.helpers";

import TableStocksReceipt from "@/components/tables/TableStocksReceipt.vue";

const { setStocksReceiptHash, setStocksReceiptDetailsHash } = useAppStore();
const { fetchReceiptList, initialReceiptParams } = useStocksReceiptStore();
const {
  receiptLoading,
  receiptList,
  receiptListTotalItems,
  newReceiptOperation,
} = storeToRefs(useStocksReceiptStore());
const { dateKeydownMask } = useHelpers();
const isMounted = useMounted();

const daterange = ref("");
const pageFilters = ref({
  ...initialReceiptParams,
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
  [pageFilters, newReceiptOperation],
  ([filtersV, newV]) => {
    if (filtersV || newV) {
      fetchReceiptList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (row: any) => {
  setStocksReceiptDetailsHash(row.id);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialReceiptParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">Поступление товаров и услуг</div>

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

    <el-button @click="setStocksReceiptHash" type="primary">
      Добавить поступление</el-button
    >
  </Teleport>

  <TableStocksReceipt
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    v-model:pagination="pageFilters"
    v-loading="receiptLoading"
    :items="receiptList"
    :totalItems="receiptListTotalItems"
    :empty-text="
      daterange.length
        ? 'В этот период не было поступлений'
        : 'Поступления не производились'
    "
    :rowClassName="'cursor-pointer'"
    :loading="receiptLoading"
    border
    with-pagination
    @row-click="onRowClick"
  />
</template>

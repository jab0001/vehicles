<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useStocksWriteOffStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksWriteOff from "@/components/forms/FormsStocksWriteOff.vue";
import { useStocksNomenclature } from "@/composables/useStocks";
import { computed, watch } from "vue";

const route = useRoute();
const { fetchWriteOfOperationDetails } = useStocksWriteOffStore();
const { writeOfDetailsResult, writeOfDetalsLoading } = storeToRefs(
  useStocksWriteOffStore()
);
const {
  nomenclatureListWithoutPagination,
  fetchnomenclatureWithoutPaginationList,
} = useStocksNomenclature();

const getQuantityById = computed(() => {
  return (id: number) =>
    nomenclatureListWithoutPagination?.value?.find((item) => item?.id === id)?.item?.quantity ?? "0";
});

fetchWriteOfOperationDetails({
  stock_operation_id: route.hash?.split("/")[2],
  operation_type: "EXPENDITURE",
}).then(() => {
  fetchnomenclatureWithoutPaginationList({
    nomenclature_type: "ITEM",
    search: undefined,
    stock_id: writeOfDetailsResult?.value?.stock_id,
    only_available: true,
  });
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      Списание {{ writeOfDetailsResult?.id }}
    </h1>
    <FormsStocksWriteOff v-loading="writeOfDetalsLoading" disabled>
      <div class="w-full flex items-center justify-between pt-4 border-t mb-4">
        <h3 class="text-base font-medium">Товары</h3>
        <el-button disabled> Добавить </el-button>
      </div>

      <el-table :data="writeOfDetailsResult?.items ?? []" size="small" border>
        <el-table-column label="Номенклатура" prop="nomenclature.name">
        </el-table-column>
        <el-table-column label="Остаток единиц" prop="" width="112">
          <template #default="{ row }">
            {{ +getQuantityById(row.nomenclature_id) }}
        </template>
        </el-table-column>
        <el-table-column label="Количество" prop="quantity" width="90">
        </el-table-column>
      </el-table>
    </FormsStocksWriteOff>
  </UiDrawerWrapper>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useStocksPostingStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksPosting from "@/components/forms/FormsStocksPosting.vue";
import { computed } from "vue";
import { useStocksNomenclature } from "@/composables/useStocks";

const route = useRoute();
const { fetchPostingOperationDetails } = useStocksPostingStore();
const { postingDetailsResult, postingDetalsLoading } = storeToRefs(
  useStocksPostingStore()
);
const {
  nomenclatureListWithoutPagination,
  fetchnomenclatureWithoutPaginationList,
} = useStocksNomenclature();

const getQuantityById = computed(() => {
  return (id: number) =>
    nomenclatureListWithoutPagination?.value?.find((item) => item?.id === id)?.item?.quantity ?? "0";
});

fetchPostingOperationDetails({
  stock_operation_id: route.hash?.split("/")[2],
  operation_type: "RECOGNITION",
}).then(() => {
  fetchnomenclatureWithoutPaginationList({
    nomenclature_type: "ITEM",
    search: undefined,
    stock_id: postingDetailsResult?.value?.stock_id,
    only_available: true,
  });
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      Оприходование {{ postingDetailsResult?.id }}
    </h1>
    <FormsStocksPosting v-loading="postingDetalsLoading" disabled>
      <div class="w-full flex items-center justify-between pt-4 border-t mb-4">
        <h3 class="text-base font-medium">Товары</h3>
        <el-button disabled> Добавить </el-button>
      </div>

      <el-table :data="postingDetailsResult?.items ?? []" size="small" border>
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
    </FormsStocksPosting>
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-tabs__header) {
  display: flex !important;
  align-items: center !important;
  margin: 0;
  margin-bottom: -1px;
}
</style>
 ;''
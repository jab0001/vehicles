<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useStocksMovingStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksMoving from "@/components/forms/FormsStocksMoving.vue";

const route = useRoute();
const { fetchMovingOperationDetails } = useStocksMovingStore();
const { movingDetalsLoading, movingDetailsResult } = storeToRefs(
  useStocksMovingStore()
);

fetchMovingOperationDetails({
  stock_operation_id: route.hash?.split("/")[2],
  operation_type: "MOVEMENT",
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      Перемещение {{ movingDetailsResult?.id }}
    </h1>
    <FormsStocksMoving v-loading="movingDetalsLoading" disabled>
      <div class="w-full flex items-center justify-between pt-4 border-t mb-4">
        <h3 class="text-base font-medium">Товары</h3>
        <el-button disabled> Добавить </el-button>
      </div>

      <el-table :data="movingDetailsResult?.items ?? []" size="small" border>
        <el-table-column label="Номенклатура" prop="nomenclature.name">
        </el-table-column>
        <el-table-column label="Остаток единиц" prop="" width="112">
        </el-table-column>
        <el-table-column label="Количество" prop="quantity" width="90">
        </el-table-column>
      </el-table>
    </FormsStocksMoving>
  </UiDrawerWrapper>
</template>

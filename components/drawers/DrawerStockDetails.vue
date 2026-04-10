<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useStocksStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStock from "@/components/forms/FormsStock.vue";

const route = useRoute();
const { fetchStockDetails, updateStock } = useStocksStore();
const { stockDetailsResult, stockDetailsLoading, updateStockLoading } =
  storeToRefs(useStocksStore());

fetchStockDetails({
  stock_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium">
      Mесто хранения {{ stockDetailsResult?.id }}
    </h1>

    <FormsStock
      v-loading="stockDetailsLoading || updateStockLoading"
      class="mt-4"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button type="primary" @click="updateStock">Сохранить</el-button>
        </div>
      </template>
    </FormsStock>
  </UiDrawerWrapper>
</template>

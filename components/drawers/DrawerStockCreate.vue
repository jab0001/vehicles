<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useStocksStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStock from "@/components/forms/FormsStock.vue";

const { createStock } = useStocksStore();
const { createStockLoading } = storeToRefs(useStocksStore());
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium">Добавить место хранения</h1>

    <FormsStock v-loading="createStockLoading" class="mt-4">
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button type="primary" @click="createStock">Создать</el-button>
        </div>
      </template>
    </FormsStock>
  </UiDrawerWrapper>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useStocksCostItemsStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksCostItem from "@/components/forms/FormsStocksCostItem.vue";

const { createCostItem } = useStocksCostItemsStore();
const { createCostItemLoading } = storeToRefs(useStocksCostItemsStore());
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Добавить статью затрат</h1>
    <FormsStocksCostItem>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="createCostItem"
            :loading="createCostItemLoading"
          >
            Создать
          </el-button>
        </div>
      </template>
    </FormsStocksCostItem>
  </UiDrawerWrapper>
</template>
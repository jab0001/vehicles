<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useStocksNomenclatureStore } from "@/stores/stocksStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksNomenclature from "@/components/forms/FormsStockNomenclature.vue";

const route = useRoute();
const { updateNomenclature, fetchNomenclatureDetails } =
  useStocksNomenclatureStore();
const {
  updateNomenclatureLoading,
  nomenclatureDetailsLoading,
  nomenclatureDetailsResult,
} = storeToRefs(useStocksNomenclatureStore());

fetchNomenclatureDetails({
  nomenclature_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      Номенклатура {{ nomenclatureDetailsResult?.id }}
    </h1>

    <FormsStocksNomenclature
      v-loading="updateNomenclatureLoading || nomenclatureDetailsLoading"
      editable
    >
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="updateNomenclature"
            :loading="updateNomenclatureLoading"
          >
            Сохранить
          </el-button>
        </div>
      </template>
    </FormsStocksNomenclature>
  </UiDrawerWrapper>
</template>

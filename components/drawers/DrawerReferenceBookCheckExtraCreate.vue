<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useCheckExtraStore } from "@/stores/checkExtraStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsCheckExtra from "@/components/forms/FormsCheckExtra.vue";

const { createCheckExtra } = useCheckExtraStore();
const { createCheckExtraLoading } = storeToRefs(
  useCheckExtraStore()
);
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Новый пункт чек-листа</h1>
    <FormsCheckExtra>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="createCheckExtra"
            :loading="createCheckExtraLoading"
          >
            Создать
          </el-button>
        </div>
      </template>
    </FormsCheckExtra>
  </UiDrawerWrapper>
</template>

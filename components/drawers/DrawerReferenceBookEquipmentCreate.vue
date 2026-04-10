<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useEquipmentStore } from "@/stores/equipmentStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsEquipment from "@/components/forms/FormsEquipment.vue";

const { createEquipment } = useEquipmentStore();
const { createEquipmentLoading } = storeToRefs(
  useEquipmentStore()
);
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Новый элемент комплектации</h1>
    <FormsEquipment>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="createEquipment"
            :loading="createEquipmentLoading"
          >
            Создать
          </el-button>
        </div>
      </template>
    </FormsEquipment>
  </UiDrawerWrapper>
</template>

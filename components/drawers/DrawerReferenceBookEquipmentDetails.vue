<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { watch } from "vue";
import { useEquipmentStore } from "@/stores/equipmentStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsEquipment from "@/components/forms/FormsEquipment.vue";

const route = useRoute();
const { editEquipment, getEquipmentById } = useEquipmentStore();
const {
  editEquipmentLoading,
  equipmentList,
  equipmentForm,
} = storeToRefs(useEquipmentStore());

const onEditEquipment = () => {
  editEquipment(route.hash.split("/")[2]);
};

watch(
  equipmentList,
  (v) => {
    if (v?.length) {
      const equipment = getEquipmentById(route.hash.split("/")[2]);
      if (equipment?.id) {
        equipmentForm.value = {...equipment};
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Изменить элемент комплектации</h1>
    <FormsEquipment>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="onEditEquipment"
            :loading="editEquipmentLoading"
          >
            Изменить
          </el-button>
        </div>
      </template>
    </FormsEquipment>
  </UiDrawerWrapper>
</template>

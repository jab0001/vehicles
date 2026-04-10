<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { watch } from "vue";
import { useVehicleGroupsStore } from "@/stores/vehicles";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";

import FormsVehicleGroup from "../forms/FormsVehicleGroup.vue";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const route = useRoute();
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
const { editVehicleGroup, getVehicleGroupById } = useVehicleGroupsStore();
const {
  editVehicleGroupsLoading,
  vehicleGroups,
  vehicleGroupForm,
} = storeToRefs(useVehicleGroupsStore());

const onEditGroup = () => {
  editVehicleGroup(currentCompanyId.value, +route.hash.split("/")[2]);
};

watch(
  vehicleGroups,
  (v) => {
    if (v?.length) {
      const group = getVehicleGroupById(route.hash.split("/")[2]);
      if (group?.id) {
        vehicleGroupForm.value.name = group.name;
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Редактировать группу</h1>
    <FormsVehicleGroup>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="onEditGroup"
            :loading="editVehicleGroupsLoading"
          >
            Изменить
          </el-button>
        </div>
      </template>
    </FormsVehicleGroup>
  </UiDrawerWrapper>
</template>

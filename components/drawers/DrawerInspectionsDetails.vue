<script setup lang="ts">
import { onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import InspectionsInfo from "@/components/inspections/InspectionsInfo.vue";

import { useInspectionsStore } from "@/stores/inspections";
import { useCheckExtraStore } from "@/stores/checkExtraStore";
import { useEquipmentStore } from "@/stores/equipmentStore";
import { useVehicleEquipmentStore } from "@/stores/vehicles";

const route = useRoute();
const {
  fetchInspectionById,
  clearInspectionForm,
  clearInspectionsFilesLists,
  clearInspectionsCarInfoWidget,
} = useInspectionsStore();

const { fetchInspectionByIdResponse, inspectionForm } = storeToRefs(
  useInspectionsStore()
);

const { fetchInspectionSettingsRequest } = useInspectionsStore();
const { fetchCheckExtraList, fetchCheckExtraHistoryList } =
  useCheckExtraStore();
const { fetchEquipmentList, fetchEquipmentListHistory } = useEquipmentStore();
const { fetchVehicleEquipmentsHistoryRequest } = useVehicleEquipmentStore();
fetchInspectionById({
  vehicle_inspection_id: Number(route.hash.split("/")[2]),
}).then(() => {
  if (fetchInspectionByIdResponse.value?.id) {
    inspectionForm.value = fetchInspectionByIdResponse.value;
  }
  fetchVehicleEquipmentsHistoryRequest({
    vehicle_id: inspectionForm.value.vehicle_id!,
    include_deleted: true,
  });
});

fetchInspectionSettingsRequest({
  vehicle_id: inspectionForm.value.vehicle_id!,
});
fetchCheckExtraList();
fetchCheckExtraHistoryList({
  search: undefined,
  page: 1,
  limit: 0,
  include_deleted: true,
});
fetchEquipmentList();
fetchEquipmentListHistory({
  search: undefined,
  page: 1,
  limit: 0,
  include_deleted: true,
});

onUnmounted(() => {
  clearInspectionsFilesLists();
  clearInspectionForm();
  clearInspectionsCarInfoWidget();
  fetchInspectionByIdResponse.value = undefined;
});
</script>

<template>
  <UiDrawerWrapper>
    <InspectionsInfo />
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-main) {
  padding: 0 !important;
}
</style>

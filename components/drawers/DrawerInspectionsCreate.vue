<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";

import { useInspectionsStore } from "@/stores/inspections";
import { useDraftsStore } from "@/stores/draftsStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import InspectionsCreateForm from "@/components/inspections/InspectionsCreateForm.vue";
import InspectionsInfo from "@/components/inspections/InspectionsInfo.vue";

const {
  inspectionForm,
  selectedDriver,
  selectedVehicle,

  bodyFrontImage,
  bodyLeftImage,
  bodyRightImage,
  bodyBackImage,
  interiorDashImage,
  interiorFrontImage,
  interiorBacktImage,
  interiorTrunkImage,
  docsImage,
  certificateImage,
  extraEquipImage,
} = storeToRefs(useInspectionsStore());
const { createDraftRequest, updateDraftRequest } = useDraftsStore();
const {
  clearInspectionForm,
  clearInspectionsFilesLists,
  clearInspectionsCarInfoWidget,
} = useInspectionsStore();
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
const { newDraft, selectedDraftInspection } = storeToRefs(useDraftsStore());
const showInspectionInfo = ref(false);

const serializeDraftDataToServer = (v: any) => {
  return {
    ...v,
    documents: [
      ...bodyFrontImage.value,
      ...bodyLeftImage.value,
      ...bodyRightImage.value,
      ...bodyBackImage.value,
      ...interiorDashImage.value,
      ...interiorFrontImage.value,
      ...interiorBacktImage.value,
      ...interiorTrunkImage.value,
      ...docsImage.value,
      ...certificateImage.value,
      ...extraEquipImage.value,
    ],
    driver: selectedDriver.value ? selectedDriver.value : null,
    vehicle: selectedVehicle.value
      ? {
          ...selectedVehicle.value,
          brand_id: selectedVehicle.value?.brand?.id,
          car_model_id: selectedVehicle.value?.car_model?.id,
          color_id: selectedVehicle.value?.color?.id,
        }
      : undefined,
  };
};

const debouncedFn = useDebounceFn((v: any) => {
  if (newDraft.value?.id || selectedDraftInspection.value?.id) {
    updateDraftRequest({
      id: newDraft.value?.id || selectedDraftInspection.value?.id!,
      draft_type: "vehicle_inspection",
      data: serializeDraftDataToServer(v),
    });
  } else {
    createDraftRequest({
      company_id: currentCompanyId.value,
      draft_type: "vehicle_inspection",
      data: serializeDraftDataToServer(v),
    });
  }
}, 2000);

watch(
  inspectionForm,
  (v) => {
    debouncedFn(v);
  },
  { deep: true }
);

const openInspectiosInfo = () => {
  showInspectionInfo.value = true;
};

onUnmounted(() => {
  clearInspectionsFilesLists();
  clearInspectionForm();
  clearInspectionsCarInfoWidget();
  newDraft.value = undefined;
  selectedDraftInspection.value = undefined;
});
</script>

<template>
  <UiDrawerWrapper>
    <InspectionsCreateForm
      class="p-5"
      @start-inspection="openInspectiosInfo"
      v-show="!showInspectionInfo"
    />
    <InspectionsInfo v-show="showInspectionInfo" />
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-main) {
  padding: 0 !important;
}
</style>

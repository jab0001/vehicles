<script setup lang="ts">
import VehiclesLicencePlate from "@/components/vehicles/VehiclesLicencePlate.vue";
import VehiclesInfo from "@/components/vehicles/VehiclesInfo.vue";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import { useVehiclesStore } from "@/stores/vehicles";
import { useDraftsStore } from "@/stores/draftsStore";
import { storeToRefs } from "pinia";
import { ref, watch, onUnmounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useIntegrationsImportStore } from "@/stores/integrationsStore";

const { serializeVehicleDataToServer } = useVehiclesStore();
const {
  vehicleCreateForm,
  vehicleCreateFormRegistrationCertificatePart,
  vehicleCreateFormDealPart,
  vehicleCreateFormLicence,
  vehicleCreateFormOther,
  allVehicleDocuments,
} = storeToRefs(useVehiclesStore());
const { createDraftRequest, updateDraftRequest } = useDraftsStore();
const { newDraft, selectedDraftVehicle } = storeToRefs(useDraftsStore());
const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);
const isComponentMounted = ref(true);
const { isImportedDraft } = storeToRefs(useIntegrationsImportStore());

const debouncedFn = useDebounceFn((v: any) => {
  if (!isComponentMounted.value) return;

  if (isImportedDraft.value) {
    return;
  }

  if (newDraft.value?.id || selectedDraftVehicle.value?.id) {
    updateDraftRequest({
      id: newDraft.value?.id || selectedDraftVehicle.value?.id!,
      draft_type: "vehicle",
      data: serializeVehicleDataToServer(),
    });
  } else {
    createDraftRequest({
      company_id: currentCompanyId.value,
      draft_type: "vehicle",
      data: serializeVehicleDataToServer(),
    });
  }
}, 2000);

watch(
  [
    vehicleCreateForm,
    vehicleCreateFormRegistrationCertificatePart,
    vehicleCreateFormDealPart,
    vehicleCreateFormLicence,
    vehicleCreateFormOther,
    allVehicleDocuments,
  ],
  (v) => {
    debouncedFn(v);
  },
  { deep: true }
);

onUnmounted(() => {
  isComponentMounted.value = false;
  newDraft.value = undefined;
  selectedDraftVehicle.value = undefined;
});
</script>

<template>
  <UiDrawerWrapper class="vehicle-create">
    <template #aside>
      <div class="flex flex-col gap-3 p-5">
        <VehiclesLicencePlate />
        <span class="subtitle">Новый автомобиль</span>
      </div>
    </template>

    <VehiclesInfo />
  </UiDrawerWrapper>
</template>

<style scoped>
.subtitle {
  @apply text-sm font-medium;
  color: var(--text-color-disabled);
}
.vehicle-create :deep(.el-main) {
  padding: 0;
}
</style>

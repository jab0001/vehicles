<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useVehicleGroupsStore } from "@/stores/vehicles";
import type { IVehicleGroup } from "@/types/vehicles";
import TableReferenceBookVehicleGroups from "@/components/tables/TableReferenceBookVehicleGroups.vue";
import ModalReferenceBookVehicleGroupDelete from "@/components/modals/ModalReferenceBookVehicleGroupDelete.vue";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const isMounted = useMounted();

const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

const { fetchVehicleGroups } =
  useVehicleGroupsStore();
const {
  vehicleGroups,
  fetchVehicleGroupsLoading,
  createVehicleGroupsResponse,
  deleteVehicleGroupsLoading,
  editVehicleGroupsResponse,
} = storeToRefs(useVehicleGroupsStore());
const {
  setReferenceBookVehicleGroupCreateHash,
  setReferenceBookVehicleGroupDetailsHash,
} = useAppStore();

const modalDeleteVisible = ref<boolean>(false);
const selectedId = ref();

const onRowClick = (rowItem: IVehicleGroup) => {
  setReferenceBookVehicleGroupDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: IVehicleGroup) => {
  selectedId.value = rowItem.id;
  modalDeleteVisible.value = true;
};


watch(
  [createVehicleGroupsResponse, editVehicleGroupsResponse],
  ([createV, editV]) => {
    if (createV || editV) {
      fetchVehicleGroups();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

fetchVehicleGroups({
  company_id: currentCompanyId.value,
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Группы автомобилей" }}
      </div>

      <el-button
        type="primary"
        @click="setReferenceBookVehicleGroupCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookVehicleGroups
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="vehicleGroups || []"
    :total-items="0"
    :loading="
      deleteVehicleGroupsLoading || fetchVehicleGroupsLoading
    "
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />

  <ModalReferenceBookVehicleGroupDelete
    v-if="modalDeleteVisible"
    :modal-visible="modalDeleteVisible"
    :item-id="selectedId"
    @close-modal="modalDeleteVisible = false"
  />
</template>

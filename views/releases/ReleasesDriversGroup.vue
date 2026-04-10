<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, reactive, watch } from "vue";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

import { useDriversGroups } from "@/composables/useVehiclesOnLine";

import type { IReleasesDriverGroup } from "@/types/vehiclesOnLine";

import TableReleasesDriversGroup from "@/components/tables/TableReleasesDriversGroup.vue";
import VehiclesOnLineDriverGroupsModal from "@/components/vehiclesOnLine/VehiclesOnLineDriverGroupsModal.vue";

const {
  driversGroupList,
  driversGroupTotalItems,
  driverGroupsListLoading,
  fetchDriverGroupsList,
} = useDriversGroups();
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

const driverGroupsModalVisible = ref(false);
const selectedGroup = ref<IReleasesDriverGroup>();
const pageParams = ref({
  company_id: currentCompanyId.value,
  limit: 10,
  page: 1,
  is_active: true,
});

watch(
  pageParams,
  (v) => {
    fetchDriverGroupsList(v);
  },
  { deep: true, immediate: true }
);

const closeDriverGroupModal = () => {
  selectedGroup.value = undefined;
  driverGroupsModalVisible.value = false;
};

const handleRefresh = () => {
  closeDriverGroupModal();
  fetchDriverGroupsList({ ...pageParams.value });
};
const onRowClick = (rowItem: IReleasesDriverGroup) => {
  selectedGroup.value = { ...rowItem };
  driverGroupsModalVisible.value = true;
};
</script>

<template>
  <Teleport defer to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">Сменные водители</div>
      <!-- <el-button type="primary" @click="driverGroupsModalVisible = true"
        >Добавить группу</el-button
      > -->
    </div>
  </Teleport>

  <div>
    <TableReleasesDriversGroup
      v-model:pagination="pageParams"
      v-loading="driverGroupsListLoading"
      class="h-[calc(100vh-60px)] flex flex-col pb-5"
      :items="driversGroupList"
      :totalItems="driversGroupTotalItems"
      :empty-text="'Группы не добавлены'"
      :rowClassName="'cursor-pointer'"
      :loading="driverGroupsListLoading"
      border
      with-pagination
      @row-click="onRowClick"
    />

    <VehiclesOnLineDriverGroupsModal
      v-if="driverGroupsModalVisible"
      :modal-visible="driverGroupsModalVisible"
      :group="selectedGroup"
      on-line-disabled
      @close-modal="closeDriverGroupModal"
      @refresh="handleRefresh"
    />
  </div>
</template>

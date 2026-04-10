<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { useMaintenanceStore } from "@/stores/maintenanceStore";
import { useAppStore } from "@/stores/appStore";

import TableMaintenance from "@/components/tables/TableMaintenance.vue";
import UiSearch from "@/components/ui/UiSearch.vue";

const { initialParams, fetchMaintenanceList } = useMaintenanceStore();
const {
  maintenanceList,
  maintenanceListTotalItems,
  maintenanceListLoading,
  editedMaintenance,
  newMaintenance,
} = storeToRefs(useMaintenanceStore());
const { setMaintenanceCreateHash, setMaintenanceDetailsHash } = useAppStore();
const pageFilters = ref({
  ...initialParams,
});

watch(
  [pageFilters, editedMaintenance, newMaintenance],
  ([filtersV, newV, editedV]) => {
    if (filtersV || newV || editedV) {
      fetchMaintenanceList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: any) => {
  setMaintenanceDetailsHash(rowItem.id, null);
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialParams,
  };
};
</script>

<template>
  <Teleport defer to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Техобслуживание" }}
      </div>
      <div class="flex items-center gap-3">
        <UiSearch
          v-model="pageFilters.plate_number"
          class="w-56"
          :placeholder="'Поиск по а/м, организации и мастеру'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>

      <el-button type="primary" @click="setMaintenanceCreateHash(null)">{{
        "Новое техобслуживание"
      }}</el-button>
    </div>
  </Teleport>

  <TableMaintenance
    v-model:pagination="pageFilters"
    v-loading="maintenanceListLoading"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="maintenanceList"
    :totalItems="maintenanceListTotalItems"
    :empty-text="
      pageFilters.plate_number
        ? 'Ничего не найдено'
        : 'Техобслуживания не добавлены'
    "
    :rowClassName="'cursor-pointer'"
    :loading="maintenanceListLoading"
    border
    with-pagination
    :inVehicle="false"
    @row-click="onRowClick"
  />
</template>

<style scoped></style>

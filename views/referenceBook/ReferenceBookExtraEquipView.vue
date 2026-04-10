<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useExtraEquipmentsStore } from "@/stores/extraEquipmentsStore";
import type { IExtraEquipment } from "@/types/extraEquipments";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookExtraEquip from "@/components/tables/TableReferenceBookExtraEquip.vue";

const isMounted = useMounted();
const {
  extraEquipments,
  newExtraEquipment,
  editExtraEquipmentResult,
  extraEquipmentsListLoading,
  deleteExtraEquipmentLoading,
  pageFilters,
} = storeToRefs(useExtraEquipmentsStore());
const { fetchExtraEquipmentsList, clearFilters, deleteExtraEquip } =
  useExtraEquipmentsStore();
const {
  setReferenceBookExtraEquipCreateHash,
  setReferenceBookExtraEquipDetailsHash,
} = useAppStore();

watch(
  [newExtraEquipment, editExtraEquipmentResult],
  ([newFineV, updateV]) => {
    if (newFineV || updateV) {
      fetchExtraEquipmentsList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: IExtraEquipment) => {
  setReferenceBookExtraEquipDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: IExtraEquipment) => {
  deleteExtraEquip(rowItem.id);
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Доп. начисления" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button type="primary" @click="setReferenceBookExtraEquipCreateHash">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <TableReferenceBookExtraEquip
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="extraEquipments ?? []"
    :total-items="0"
    :loading="extraEquipmentsListLoading || deleteExtraEquipmentLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookEquipment from "@/components/tables/TableReferenceBookEquipment.vue";
import ModalReferenceBookEquipmentDelete from "@/components/modals/ModalReferenceBookEquipmentDelete.vue";
import { useEquipmentStore } from "@/stores/equipmentStore";
import type { IEquipment } from "@/types/equipment";

const isMounted = useMounted();
const {
  newEquipment,
  editEquipmentResult,
  equipmentListLoading,
  equipmentList,
  equipmentListTotalItems,
  pageFilters,
} = storeToRefs(useEquipmentStore());
const { fetchEquipmentList, clearFilters } =
useEquipmentStore()


const {
  setReferenceBookEquipmentCreateHash,
  setReferenceBookEquipmentDetailsHash,
} = useAppStore();

const modalDeleteVisible = ref<boolean>(false);
const selectedId = ref();

watch(
  [pageFilters, newEquipment, editEquipmentResult],
  ([newFineV, updateV]) => {
    if (newFineV || updateV) {
      fetchEquipmentList({
        ...pageFilters.value,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: IEquipment) => {
  setReferenceBookEquipmentDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: IEquipment) => {
  selectedId.value = rowItem.id;
  modalDeleteVisible.value = true;
};

onMounted(() => {
  fetchEquipmentList({
    ...pageFilters.value,
  });
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Комплектация а/м" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button
        type="primary"
        @click="setReferenceBookEquipmentCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookEquipment
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="equipmentList"
    :display-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :sortable-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :total-items="equipmentListTotalItems"
    :loading="equipmentListLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />

  <ModalReferenceBookEquipmentDelete
    v-if="modalDeleteVisible"
    :modal-visible="modalDeleteVisible"
    :item-id="selectedId"
    @close-modal="modalDeleteVisible = false"
  />
</template>

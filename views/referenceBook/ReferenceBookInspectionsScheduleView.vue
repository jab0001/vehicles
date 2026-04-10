<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useInspectionsScheduleStore } from "@/stores/inspectionsScheduleStore";
import type { IInspectionsSchedule } from "@/types/inspectionsSchedule";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookInspectionsSchedule from "@/components/tables/TableReferenceBookInspectionsSchedule.vue";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import ModalReferenceBookInspectionsScheduleDelete from "@/components/modals/ModalReferenceBookInspectionsScheduleDelete.vue";
import type { Sort } from "element-plus";

const isMounted = useMounted();
const {
  newInspectionsSchedule,
  editInspectionsScheduleResult,
  inspectionsScheduleListLoading,
  inspectionsScheduleList,
  inspectionsScheduleListTotalItems,
  deleteInspectionsScheduleLoading,
  pageFilters,
} = storeToRefs(useInspectionsScheduleStore());
const { fetchInspectionsScheduleList, clearFilters } =
  useInspectionsScheduleStore();

const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
const {
  setReferenceBookInspectionsScheduleCreateHash,
  setReferenceBookInspectionsScheduleDetailsHash,
} = useAppStore();

const modalDeleteInspectionsScheduleVisible = ref<boolean>(false);
const selectedInspectionsScheduleId = ref();

watch(
  [pageFilters, newInspectionsSchedule, editInspectionsScheduleResult],
  ([newFineV, updateV]) => {
    if (newFineV || updateV) {
      fetchInspectionsScheduleList({
        ...pageFilters.value,
        company_id: currentCompanyId.value,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: IInspectionsSchedule) => {
  const isDefault = rowItem.vehicle_brand ? "" : "default";
  setReferenceBookInspectionsScheduleDetailsHash(rowItem.id, isDefault);
};
const onDeleteRowItem = (rowItem: IInspectionsSchedule) => {
  selectedInspectionsScheduleId.value = rowItem.id;
  modalDeleteInspectionsScheduleVisible.value = true;
};

onMounted(() => {
  fetchInspectionsScheduleList({
    ...pageFilters.value,
    company_id: currentCompanyId.value,
  });
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Шаблоны ТО" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.name"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button
        type="primary"
        @click="setReferenceBookInspectionsScheduleCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookInspectionsSchedule
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="inspectionsScheduleList"
    :display-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :sortable-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :total-items="inspectionsScheduleListTotalItems"
    :loading="inspectionsScheduleListLoading || deleteInspectionsScheduleLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />

  <ModalReferenceBookInspectionsScheduleDelete
    v-if="modalDeleteInspectionsScheduleVisible"
    :modal-visible="modalDeleteInspectionsScheduleVisible"
    :item-id="selectedInspectionsScheduleId"
    @close-modal="modalDeleteInspectionsScheduleVisible = false"
  />
</template>

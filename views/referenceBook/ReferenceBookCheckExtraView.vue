<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookCheckExtra from "@/components/tables/TableReferenceBookCheckExtra.vue";
import ModalReferenceBookCheckExtraDelete from "@/components/modals/ModalReferenceBookCheckExtraDelete.vue";
import { useCheckExtraStore } from "@/stores/checkExtraStore";
import type { ICheckExtra } from "@/types/checkExtra";

const isMounted = useMounted();
const {
  newCheckExtra,
  editCheckExtraResult,
  checkExtraListLoading,
  checkExtraList,
  checkExtraListTotalItems,
  pageFilters,
} = storeToRefs(useCheckExtraStore());
const { fetchCheckExtraList, clearFilters } =
useCheckExtraStore()


const {
  setReferenceBookCheckExtraCreateHash,
  setReferenceBookCheckExtraDetailsHash,
} = useAppStore();

const modalDeleteVisible = ref<boolean>(false);
const selectedId = ref();

watch(
  [pageFilters, newCheckExtra, editCheckExtraResult],
  ([newFineV, updateV]) => {
    if (newFineV || updateV) {
      fetchCheckExtraList({
        ...pageFilters.value,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: ICheckExtra) => {
  setReferenceBookCheckExtraDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: ICheckExtra) => {
  selectedId.value = rowItem.id;
  modalDeleteVisible.value = true;
};

onMounted(() => {
  fetchCheckExtraList({
    ...pageFilters.value,
  });
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Чек-лист осмотра" }}
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
        @click="setReferenceBookCheckExtraCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookCheckExtra
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="checkExtraList"
    :display-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :sortable-columns="['name', 'vehicle_brand', 'vehicle_model']"
    :total-items="checkExtraListTotalItems"
    :loading="checkExtraListLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />

  <ModalReferenceBookCheckExtraDelete
    v-if="modalDeleteVisible"
    :modal-visible="modalDeleteVisible"
    :item-id="selectedId"
    @close-modal="modalDeleteVisible = false"
  />
</template>

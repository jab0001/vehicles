<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import { useReasonChangingStatusStore } from "@/stores/reasonChangingStatusStore";
import type { IReasonChangingStatus } from "@/types/reasonChangingStatus";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookDismissal from "@/components/tables/TableReferenceBookDismissal.vue";
import UiBaseDeleteModal from "@/components/ui/UiBaseDeleteModal.vue";

const isMounted = useMounted();
const {
  setReferenceBookDismissalCreateHash,
  setReferenceBookDismissalDetailsHash,
} = useAppStore();
const {
  reasonChangingList,
  reasonChangingListTotalItems,
  reasonChangingStatusListLoading,
  newReasonChangingStatus,
  editReasonChangingStatusResult,
  deleteReasonChangingStatusLoading,
  deleteReasonChangingStatusResult,
} = storeToRefs(useReasonChangingStatusStore());
const { emptyPageFilters, fetchReasonChangingStatusList, deleteStatusReason } =
  useReasonChangingStatusStore();
const pageFilters = ref({
  ...emptyPageFilters,
});
const modalDeleteVisible = ref(false);
const selectedStatusReason = ref<any>();
watch(
  [
    pageFilters,
    newReasonChangingStatus,
    editReasonChangingStatusResult,
    deleteReasonChangingStatusResult,
  ],
  ([filtersV, newV, editV, delV]) => {
    if (filtersV || newV || editV || delV) {
      fetchReasonChangingStatusList({
        ...pageFilters.value,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const clearFilters = () => {};
const onRowClick = (v: IReasonChangingStatus) => {
  setReferenceBookDismissalDetailsHash(v.id);
};
const onDeleteRowItem = (v: IReasonChangingStatus) => {
  selectedStatusReason.value = { ...v };
  modalDeleteVisible.value = true;
};
const handleCloseModal = () => {
  selectedStatusReason.value = undefined;
  modalDeleteVisible.value = false;
};
const handleDeleteConfirmed = async (id: number) => {
  await deleteStatusReason(id);
  handleCloseModal();
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[720px] flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "Причины увольнения" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button type="primary" @click="setReferenceBookDismissalCreateHash">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <div>
    <TableReferenceBookDismissal
      v-model:pagination="pageFilters"
      class="max-w-[720px] h-[calc(100vh-60px)] flex flex-col pb-5 mx-auto"
      :items="reasonChangingList"
      :total-items="reasonChangingListTotalItems"
      :loading="
        reasonChangingStatusListLoading || deleteReasonChangingStatusLoading
      "
      :empty-text="'Ничего не найдено'"
      @row-click="onRowClick"
      @handle-delete="onDeleteRowItem"
    />

    <UiBaseDeleteModal
      v-if="modalDeleteVisible"
      :modal-visible="modalDeleteVisible"
      :width="408"
      :id="selectedStatusReason.id"
      @close-modal="handleCloseModal"
      @success="handleDeleteConfirmed"
    >
      {{ `Вы действительно хотите удалить Причину увольнения?` }}
    </UiBaseDeleteModal>
  </div>
</template>

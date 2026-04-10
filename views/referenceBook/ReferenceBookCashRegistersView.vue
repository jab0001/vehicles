<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";

import { useAppStore } from "@/stores/appStore";
import { useCashRegistersStore } from "@/stores/cashRegistersStore";
import type { ICashRegister } from "@/types/cashRegisters";

import TableReferenceBookCashRegisters from "@/components/tables/TableReferenceBookCashRegisters.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import UiBaseDeleteModal from "@/components/ui/UiBaseDeleteModal.vue";

const isMounted = useMounted();
const { fetchCashRegistersList, deleteCashRegister } = useCashRegistersStore();
const {
  cashRegisters,
  newCashRegister,
  editCashRegisterResult,
  deletecashRegisterLoading,
  cashRegistersListLoading,
} = storeToRefs(useCashRegistersStore());
const {
  setReferenceBookCashRegistersCreateHash,
  setReferenceBookCashRegistersDetailsHash,
} = useAppStore();
const pageFilters = ref({
  search: "",
  page: 1,
  limit: 20,
});
const modalDeleteVisible = ref(false);
const selectedCashRegister = ref<any>();

watch(
  [newCashRegister, editCashRegisterResult],
  ([createV, editV]) => {
    if (createV || editV) {
      fetchCashRegistersList();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const clearFilters = () => {
  pageFilters.value = {
    search: "",
    page: 1,
    limit: 20,
  };
};
const onRowClick = (rowItem: ICashRegister) => {
  setReferenceBookCashRegistersDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: ICashRegister) => {
  // deleteCashRegister(rowItem.id);
  selectedCashRegister.value = { ...rowItem };
  modalDeleteVisible.value = true;
};
const handleCloseModal = () => {
  selectedCashRegister.value = undefined;
  modalDeleteVisible.value = false;
};
const handleDeleteConfirmed = async (id: number) => {
  await deleteCashRegister(id);
  handleCloseModal();
};

fetchCashRegistersList();
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[720px] flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "Кассы" }}
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
        @click="setReferenceBookCashRegistersCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <div>
    <TableReferenceBookCashRegisters
      class="max-w-[720px] h-[calc(100vh-60px)] flex flex-col pb-5 mx-auto"
      :items="cashRegisters ?? []"
      :loading="deletecashRegisterLoading || cashRegistersListLoading"
      :empty-text="'Ничего не найдено'"
      @row-click="onRowClick"
      @handle-delete="onDeleteRowItem"
    />

    <UiBaseDeleteModal
      v-if="modalDeleteVisible"
      :modal-visible="modalDeleteVisible"
      :width="408"
      :id="selectedCashRegister.id"
      @close-modal="handleCloseModal"
      @success="handleDeleteConfirmed"
    >
      {{ `Вы действительно хотите удалить кассу?` }}
    </UiBaseDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { debouncedRef, useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";

import TablePrintableForms from "@/components/tables/TablePrintableForms.vue";
import ModalPrintableForms from "@/components/modals/ModalPrintableForms.vue";
import UiBaseDeleteModal from "@/components/ui/UiBaseDeleteModal.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import {
  usePrintableForms,
  usePrintableFormsList,
  usePrintableFormsDelete,
  usePrintableFormsDownload,
} from "@/composables/usePrintableForms";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";
import type { IPrintableForm } from "@/types/printableForms";
import { useFiles } from "@/composables/useFiles";
import IconQuestion from "@/components/icons/IconQuestion.vue";

const isMounted = useMounted();
const { setPrintableFormHash, setPrintableFormsInfoHash } = useAppStore();

const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

const {
  request: downloadPrintableForm,
  loading: downloadPrintableFormLoading,
} = usePrintableFormsDownload();
const { request: deletePrintableForm, loading: deletePrintableFormLoading } =
  usePrintableFormsDelete();
const { list } = usePrintableForms();
const { data, fetch: fetchList } = list;
const { downloadFile, fetchUploadedFileList } = useFiles();

const modalVisible = ref(false);
const modalDeleteVisible = ref(false);
const selectedPrinted = ref<IPrintableForm>();
const searchInput = ref("");
const debouncedSearch = debouncedRef(searchInput, 500);

watch([debouncedSearch, currentCompanyId], () => {
  refresh();
});

const refresh = () => {
  fetchList({
    company_id: currentCompanyId.value,
    description: debouncedSearch.value.trim() || undefined,
  });
};

refresh();

const onRowClick = (row: IPrintableForm) => {
  setPrintableFormHash(row.id);
};
const handleEdit = (row: any) => {
  selectedPrinted.value = row;
  modalVisible.value = true;
};
const handleDelete = (row: any) => {
  console.log({ row });

  selectedPrinted.value = row;
  modalDeleteVisible.value = true;
};

const handleDeleteConfirmed = () => {
  if (selectedPrinted.value?.id)
    deletePrintableForm({
      template_id: selectedPrinted.value.id,
      company_id: currentCompanyId.value,
    }).finally(refresh);
  handleCloseModal();
};

const handleCloseModal = () => {
  selectedPrinted.value = undefined;
  modalDeleteVisible.value = false;
  modalVisible.value = false;
};

const handleDownload = (row: IPrintableForm) => {
  // fetchUploadedFileList([{ id: row.id }]);
  // downloadFile(row.id);
  console.log({ row });
  downloadPrintableForm({
    template_id: row.id,
    company_id: currentCompanyId.value,
  }).then((res) => {
    downloadFile({
      id: "_",
      name: row.description + ".docx",
      blob: res,
    });
  });
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[808px] flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "Печатные формы" }}
      </div>

      <UiSearch
        v-model="searchInput"
        class="w-72"
        :placeholder="'Поиск по названию документа'"
      />
      <div class="flex items-center gap-4">
        <IconQuestion
          class="cursor-pointer"
          @click="setPrintableFormsInfoHash"
        />
        <el-button type="primary" @click="modalVisible = true">{{
          "Добавить"
        }}</el-button>
      </div>
    </div>
  </Teleport>

  <div>
    <TablePrintableForms
      class="h-[calc(100vh-60px)] max-w-[808px] flex flex-col pb-5 mx-auto"
      :items="data"
      :loading="deletePrintableFormLoading"
      :empty-text="
        searchInput ? 'Ничего не найдено' : 'Печатные формы не добавлены'
      "
      :rowClassName="'cursor-pointer'"
      @row-click="onRowClick"
      @handle-edit="handleEdit"
      @handle-delete="handleDelete"
      @handle-download="handleDownload"
    />

    <ModalPrintableForms
      v-if="modalVisible"
      :item="selectedPrinted"
      :modal-visible="modalVisible"
      @handle-success="refresh"
      @close-modal="handleCloseModal"
    />

    <UiBaseDeleteModal
      v-if="modalDeleteVisible"
      :modal-visible="modalDeleteVisible"
      :width="408"
      :id="selectedPrinted"
      @close-modal="handleCloseModal"
      @success="handleDeleteConfirmed"
    >
      {{ "Вы действительно хотите удалить печатную форму?" }}
    </UiBaseDeleteModal>
  </div>
</template>

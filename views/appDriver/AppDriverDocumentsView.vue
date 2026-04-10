<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElNotification } from "element-plus";

import { useDocumentRegistry } from "@/composables/useDocumentRegistry";
import { useFiles } from "@/composables/useFiles";
import { useAppDriverDocumentRegistry } from "@/composables/useAppDriver";

import type { IDocumentRegistry } from "@/types/documentRegistry";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverSearchbar from "@/components/appDriver/AppDriverSearchbar.vue";
import AppDriverDocumentCard from "@/components/appDriver/AppDriverDocumentCard.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";
import FormAppDriverDaterange from "@/components/forms/FormAppDriverDaterange.vue";

const pageFilters = ref({
  page: 1,
  search: "",
  start_date: undefined,
  end_date: undefined,
});
const datesSheet = ref<{
  show: () => void;
  close: () => void;
} | null>(null);

const {
  appDriverdocumentRegistryList,
  appDriverdocumentRegistryListTotalPages,
  documentRegistryLoading,
  fetchDocumentRegistryList,
  fetchDriverDocumentRegistryFile,
} = useAppDriverDocumentRegistry();
const { downloadFile } = useFiles();

const hasPageFilter = computed(() => {
  return Object.values(pageFilters.value).some((value) => Boolean(value));
});

watch(
  () => [pageFilters.value.search, pageFilters.value.start_date],
  () => {
    appDriverdocumentRegistryList.value = [];
    fetchDocumentRegistryList({
      ...pageFilters.value,
    });
  },
  { deep: true }
);

const loadMore = () => {
  if (pageFilters.value.page < appDriverdocumentRegistryListTotalPages.value) {
    pageFilters.value.page++;
    fetchDocumentRegistryList(pageFilters.value);
  }
};
const openDocument = (item: IDocumentRegistry) => {
  fetchDriverDocumentRegistryFile({
    document_registry_record_id: item.id,
  })
    .then((res) => {
      downloadFile({
        // @ts-ignore
        id: "_",
        name: `${item.name}.doc`,
        blob: res,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Документ загружен",
        type: "success",
      });
    })
    .catch((err) => {
      console.log("err", err);
      console.log(err?.response);

      ElNotification({
        title: "Успешный запрос",
        message: err?.user_message ?? "Ошибка при загрузке документа",
        type: "error",
      });
    });
};
const clearDateFilters = () => {
  pageFilters.value = {
    ...pageFilters.value,
    page: 1,
    start_date: undefined,
    end_date: undefined,
  };
};

fetchDocumentRegistryList({
  ...pageFilters.value,
});
</script>
<template>
  <div class="relative flex-1 flex flex-col p-4">
    <AppDriverMainHeader title="Документы" />

    <AppDriverSearchbar
      v-model:search="pageFilters.search"
      placeholder="Поиск по названию документа"
      :badge-visible="Boolean(pageFilters.end_date && pageFilters.start_date)"
      @open-daterange="datesSheet?.show"
    />

    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMore"
    >
      <AppDriverDocumentCard
        v-for="item in appDriverdocumentRegistryList"
        :document="item"
        @click="openDocument(item)"
      />

      <template #target>
        <el-skeleton
          class="px-5"
          v-if="
            pageFilters.page < appDriverdocumentRegistryListTotalPages ||
            documentRegistryLoading
          "
          animated
          :count="2"
        >
          <template #template>
            <div class="py-2">
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
            </div>
          </template>
        </el-skeleton>
      </template>
    </InfinityLoad>

    <UiEmptyItems
      v-if="!appDriverdocumentRegistryList.length && !documentRegistryLoading"
      :text="
        !hasPageFilter ? 'Документов нет, пока что...' : 'Документы не найдены'
      "
      primaryColor
    />

    <UiSheet ref="datesSheet">
      <FormAppDriverDaterange
        v-model:daterange="pageFilters"
        @confirm="datesSheet?.close()"
        @reset="clearDateFilters"
      />
    </UiSheet>
  </div>
</template>

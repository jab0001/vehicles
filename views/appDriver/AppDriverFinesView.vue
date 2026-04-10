<script setup lang="ts">
import { ref, computed, watch } from "vue";

import { useAppDriverFines } from "@/composables/useAppDriver";

import type { IFine } from "@/types/fines";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverFineCard from "@/components/appDriver/AppDriverFineCard.vue";
import AppDriverSearchbar from "@/components/appDriver/AppDriverSearchbar.vue";
import AppDriverFineDetails from "@/components/appDriver/AppDriverFineDetails.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";
import FormAppDriverDaterange from "@/components/forms/FormAppDriverDaterange.vue";

const {
  appDriverFinesListLoading,
  appDriverFinesList,
  appDriverFinesListTotalPages,
  fetchappDriverFinesList,
} = useAppDriverFines();

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
const fineDetailsRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const selectedFine = ref<IFine>();

const hasPageFilter = computed(() => {
  return Object.values(pageFilters.value).some((value) => Boolean(value));
});
watch(
  () => [pageFilters.value.search, pageFilters.value.start_date],
  () => {
    appDriverFinesList.value = [];
    fetchappDriverFinesList({
      ...pageFilters.value,
    });
  },
  { deep: true }
);

const loadMore = () => {
  if (pageFilters.value.page < appDriverFinesListTotalPages.value) {
    pageFilters.value.page++;
    fetchappDriverFinesList(pageFilters.value);
  }
};
const setFineDetailsData = (item: IFine) => {
  selectedFine.value = { ...item };
  fineDetailsRef.value?.show();
};
const clearDateFilters = () => {
  pageFilters.value = {
    ...pageFilters.value,
    page: 1,
    start_date: undefined,
    end_date: undefined,
  };
};

fetchappDriverFinesList({
  ...pageFilters.value,
});
</script>
<template>
  <div class="relative flex-1 flex flex-col p-4">
    <AppDriverMainHeader title="Штрафы" />

    <AppDriverSearchbar
      v-model:search="pageFilters.search"
      :badge-visible="
        Boolean(pageFilters.end_date && pageFilters.start_date)
      "
      @open-daterange="datesSheet?.show"
    />

    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMore"
    >
      <AppDriverFineCard
        v-for="item in appDriverFinesList"
        :fine="item"
        @click="setFineDetailsData(item)"
      />

      <template #target>
        <el-skeleton
          class="px-5"
          v-if="
            pageFilters.page < appDriverFinesListTotalPages ||
            appDriverFinesListLoading
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
      v-if="!appDriverFinesList.length && !appDriverFinesListLoading"
      :text="!hasPageFilter ? 'Штрафов нет, совсем' : 'Штрафы не найдены'"
      primaryColor
    />

    <UiSheet ref="datesSheet">
      <FormAppDriverDaterange
        v-model:daterange="pageFilters"
        @confirm="datesSheet?.close()"
         @reset="clearDateFilters"
      />
    </UiSheet>
    <UiSheet ref="fineDetailsRef">
      <AppDriverFineDetails :fine="selectedFine!" />
    </UiSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

import { useAppDriverInspections } from "@/composables/useAppDriver";
import type { IInspections } from "@/types/inspections";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverSearchbar from "@/components/appDriver/AppDriverSearchbar.vue";
import AppDriverInspectionsCard from "@/components/appDriver/AppDriverInspectionsCard.vue";
import AppDriverInspectionDetails from "@/components/appDriver/AppDriverInspectionDetails.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";
import FormAppDriverDaterange from "@/components/forms/FormAppDriverDaterange.vue";

const router = useRouter();
const {
  appDriverInspectionsListLoading,
  appDriverInspectionsList,
  appDriverInspectionsListTotalPages,
  fetchAppDriverInspectionsList,
} = useAppDriverInspections();

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
const inspectionDetailsRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const selectedInspection = ref<IInspections>();

const hasPageFilter = computed(() => {
  return Object.values(pageFilters.value).some((value) => Boolean(value));
});
watch(
  () => [pageFilters.value.search, pageFilters.value.start_date],
  () => {
    appDriverInspectionsList.value = [];
    fetchAppDriverInspectionsList({
      ...pageFilters.value,
    });
  },
  { deep: true }
);

const loadMore = () => {
  if (pageFilters.value.page < appDriverInspectionsListTotalPages.value) {
    pageFilters.value.page++;
    fetchAppDriverInspectionsList(pageFilters.value);
  }
};
const setInspectionDetailsData = (item: IInspections) => {
  selectedInspection.value = { ...item };
  inspectionDetailsRef.value?.show();
};
const clearDateFilters = () => {
  pageFilters.value = {
    ...pageFilters.value,
    page: 1,
    start_date: undefined,
    end_date: undefined,
  };
};

fetchAppDriverInspectionsList({
  ...pageFilters.value,
});
</script>

<template>
  <div class="relative flex-1 flex flex-col p-4">
    <AppDriverMainHeader title="Осмотры" />

    <AppDriverSearchbar
      v-model:search="pageFilters.search"
      :badge-visible="
        Boolean(pageFilters.end_date && pageFilters.start_date)
      "
      @open-daterange="datesSheet?.show"
    />

   <div class="flex-1">
    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMore"
    >
      <AppDriverInspectionsCard
        v-for="item in appDriverInspectionsList"
        :inspection="item"
        @click="setInspectionDetailsData(item)"
      />
      <template #target>
        <el-skeleton
          class="px-5"
          v-if="
            pageFilters.page < appDriverInspectionsListTotalPages ||
            appDriverInspectionsListLoading
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
   </div>

    <div
      v-if="appDriverInspectionsList.length"
      class="sticky bottom-0 bg-white p-4 rounded-t-2xl mt-2 -mx-4 -mb-4 shadow-app-driver"
    >
      <el-button
        class="w-full rounded-xl mx-auto"
        type="primary"
        size="large"
        @click="router.push({ name: 'AppDriverInspectionsCreate' })"
        >Провести осмотр</el-button
      >
    </div>

    <div
      v-if="
        !appDriverInspectionsList.length && !appDriverInspectionsListLoading
      "
      class="flex-grow flex flex-col justify-center gap-4"
    >
      <UiEmptyItems
        :text="
          !hasPageFilter ? 'Осмотры еще не проводились' : 'Осмотры не найдены'
        "
        twWidth="w-full"
        primaryColor
        class="flex-grow-0"
      />
      <el-button
        class="w-fit rounded-xl mx-auto"
        type="primary"
        size="large"
        @click="router.push({ name: 'AppDriverInspectionsCreate' })"
        >Провести осмотр</el-button
      >
    </div>

    <UiSheet ref="datesSheet">
      <FormAppDriverDaterange
        v-model:daterange="pageFilters"
        @confirm="datesSheet?.close()"
        @reset="clearDateFilters"
      />
    </UiSheet>
    <UiSheet ref="inspectionDetailsRef">
      <AppDriverInspectionDetails :inspection="selectedInspection!" />
    </UiSheet>
  </div>
</template>

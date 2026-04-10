<script setup lang="ts">
import { ref, computed, watch } from "vue";

import { useAppDriverDamages } from "@/composables/useAppDriver";
import type { IDamage } from "@/types/damages";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverSearchbar from "@/components/appDriver/AppDriverSearchbar.vue";
import AppDriverDamageCard from "@/components/appDriver/AppDriverDamageCard.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";
import FormAppDriverDaterange from "@/components/forms/FormAppDriverDaterange.vue";
import AppDriverDamageDetails from "@/components/appDriver/AppDriverDamageDetails.vue";

const {
  appDriverDamagesListLoading,
  appDriverDamagesList,
  appDriverDamagesListTotalPages,
  fetchAppDriverDamagesList,
} = useAppDriverDamages();
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
const damageDetailsRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const selectedDamage = ref<IDamage>();

const hasPageFilter = computed(() => {
  return Object.values(pageFilters.value).some((value) => Boolean(value));
});
watch(
  () => [pageFilters.value.search, pageFilters.value.start_date],
  () => {
    appDriverDamagesList.value = [];
    fetchAppDriverDamagesList({
      ...pageFilters.value,
    });
  },
  { deep: true }
);

const loadMore = () => {
  if (pageFilters.value.page < appDriverDamagesListTotalPages.value) {
    pageFilters.value.page++;
    fetchAppDriverDamagesList(pageFilters.value);
  }
};
const setDamageDetailsData = (item: IDamage) => {
  selectedDamage.value = { ...item };
  damageDetailsRef.value?.show();
};
const clearDateFilters = () => {
  pageFilters.value = {
    ...pageFilters.value,
    page: 1,
    start_date: undefined,
    end_date: undefined,
  };
};

fetchAppDriverDamagesList({
  ...pageFilters.value,
});
</script>

<template>
  <div class="relative flex-1 flex flex-col p-4">
    <AppDriverMainHeader title="Ущербы" />

    <AppDriverSearchbar
      v-model:search="pageFilters.search"
      :badge-visible="Boolean(pageFilters.end_date && pageFilters.start_date)"
      @open-daterange="datesSheet?.show"
    />

    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMore"
    >
      <AppDriverDamageCard
        v-for="item in appDriverDamagesList"
        :damage="item"
        @click="setDamageDetailsData(item)"
      />
      <template #target>
        <el-skeleton
          class="px-5"
          v-if="
            pageFilters.page < appDriverDamagesListTotalPages ||
            appDriverDamagesListLoading
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
      v-if="!appDriverDamagesList.length && !appDriverDamagesListLoading"
      :text="
        !hasPageFilter ? 'Ущербов не было зафиксировано' : 'Ущербы не найдены'
      "
      twWidth="w-full"
      primaryColor
    />

    <UiSheet ref="datesSheet">
      <FormAppDriverDaterange
        v-model:daterange="pageFilters"
        @confirm="datesSheet?.close()"
        @reset="clearDateFilters"
      />
    </UiSheet>
    <UiSheet ref="damageDetailsRef">
      <AppDriverDamageDetails :damage="selectedDamage!" />
    </UiSheet>
  </div>
</template>

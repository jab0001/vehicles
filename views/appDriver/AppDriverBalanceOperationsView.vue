<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watch } from "vue";

import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { useAppDriverBalanceOperations } from "@/composables/useAppDriver";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverSearchbar from "@/components/appDriver/AppDriverSearchbar.vue";
import AppDriverBalanceOperationDetails from "@/components/appDriver/AppDriverBalanceOperationDetails.vue";
import FormAppDriverDaterange from "@/components/forms/FormAppDriverDaterange.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";
import AppDriverBalanceOperationCard from "@/components/appDriver/AppDriverBalanceOperationCard.vue";

import type {
  IBalanceOperationDetails,
  TBalanceOperationsCategory,
} from "@/types/balanceOperations";

const route = useRoute();
const { getBalanceOperationCategory } = useBalanceOperations();
const {
  balanceOperationsListLoading,
  balanceOperationsList,
  balanceOperationsListTotalPages,
  fetchBalanceOperationsList,
} = useAppDriverBalanceOperations();

const pageFilters = ref({
  page: 1,
  // limit: 1,
  search: "",
  start_date: undefined,
  end_date: undefined,
  category: route.params.category as TBalanceOperationsCategory,
});
const datesSheet = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const balanceOperationDetailsRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const selectedOperation = ref<IBalanceOperationDetails>();

const setOperationDetailsData = (item: IBalanceOperationDetails) => {
  selectedOperation.value = { ...item };
  balanceOperationDetailsRef.value?.show();
};

const hasPageFilter = computed(() => {
  return Object.values(pageFilters.value).some((value) => Boolean(value));
});

watch(
  () => [pageFilters.value.search, pageFilters.value.start_date],
  () => {
    balanceOperationsList.value = [];
    fetchBalanceOperationsList({
      ...pageFilters.value,
    });
  },
  { deep: true }
);

const loadMore = () => {
  if (pageFilters.value.page < balanceOperationsListTotalPages.value) {
    pageFilters.value.page++;
    fetchBalanceOperationsList(pageFilters.value);
  }
};

const clearDateFilters = () => {
  pageFilters.value = {
    ...pageFilters.value,
    page: 1,
    start_date: undefined,
    end_date: undefined,
  };
};

fetchBalanceOperationsList({
  ...pageFilters.value,
});
</script>

<template>
  <div class="relative flex-1 flex flex-col p-4">
    <AppDriverMainHeader
      :title="`Баланс: ${getBalanceOperationCategory(route.params.category as TBalanceOperationsCategory)}`"
    />

    <AppDriverSearchbar
      v-model:search="pageFilters.search"
      :badge-visible="Boolean(pageFilters.end_date && pageFilters.start_date)"
      :placeholder="'Поиск'"
      @open-daterange="datesSheet?.show"
    />

    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMore"
    >
      <AppDriverBalanceOperationCard
        v-for="item in balanceOperationsList"
        :operation="item"
        @click="setOperationDetailsData(item)"
      />
      <template #target>
        <el-skeleton
          class="px-5"
          v-if="
            pageFilters.page < balanceOperationsListTotalPages ||
            balanceOperationsListLoading
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
      v-if="!balanceOperationsList.length && !balanceOperationsListLoading"
      :text="!hasPageFilter ? 'Расчеты не проводились' : 'Расчеты не найдены'"
      primaryColor
    />

    <UiSheet ref="datesSheet">
      <FormAppDriverDaterange
        v-model:daterange="pageFilters"
        @confirm="datesSheet?.close()"
        @reset="clearDateFilters"
      />
    </UiSheet>
    <UiSheet ref="balanceOperationDetailsRef">
      <AppDriverBalanceOperationDetails :operation="selectedOperation!" />
    </UiSheet>
  </div>
</template>

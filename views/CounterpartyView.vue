<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useAppStore } from "@/stores/appStore";

import TableCounterparties from "@/components/tables/TableCounterparties.vue";
import CompaniesDeleteCounterpartyModal from "@/components/companies/CompaniesDeleteCounterpartyModal.vue";
import UiSearch from "@/components/ui/UiSearch.vue";

import type { ICounterparty } from "@/types/companiesManagement";
import { ref, watch } from "vue";
import * as t from "@/types/companiesManagement";
import { useUserStore } from "@/stores/userStore";

const isMounted = useMounted();

const {
  setCompaniesCounterpartyCreateHash,
  setCompaniesCounterpartyDetailsHash,
} = useAppStore();

const {
  companiesCounterpartyList,
  companiesCounterpartyListLoading,
  companiesCounterpartyListTotalItems,
  counterpartiesParams,
  counterpartyForm,
  newCopany,
  updatedCompany,
} = storeToRefs(useCompaniesManagementStore());

const {
  fetchCompaniesCounterpartyList,
  clearForm,
  initialCounterpartiesParams,
} = useCompaniesManagementStore();
const { userProfileLocalINNString } = storeToRefs(useUserStore());

const modalDeleteCounterpartyVisible = ref<boolean>(false);
const selectedCounterpartyId = ref();
const pageFilters = ref<t.ICounterpartiesParams>({
  ...initialCounterpartiesParams,
});
const search = ref("");

watch(
  search,
  (value) => {
    if (value) {
      if (/^\d+$/.test(value)) {
        pageFilters.value.inn = value;
        pageFilters.value.name = "";
      } else {
        pageFilters.value.name = value;
        pageFilters.value.inn = "";
      }
    } else {
      pageFilters.value = {
        ...initialCounterpartiesParams,
      };
    }
  },
  { deep: true }
);

const clearCounterpartiesParams = () => {
  pageFilters.value = {
    ...initialCounterpartiesParams,
  };
  search.value = "";
};

const onRowClick = (rowItem: any) => {
  let documents_ids = [];
  if (rowItem.documents.length) {
    documents_ids = rowItem.documents.map((doc: any) => doc.id!);
  }
  counterpartyForm.value = {
    ...rowItem,
    documents_ids,
  };
  setCompaniesCounterpartyDetailsHash(rowItem.id);
};

const onDeleteRowItem = (rowItem: ICounterparty) => {
  selectedCounterpartyId.value = rowItem.id;
  modalDeleteCounterpartyVisible.value = true;
};

const addCounterparty = () => {
  setCompaniesCounterpartyCreateHash();
  clearForm();
};

watch(
  [pageFilters, newCopany, updatedCompany],
  ([filtersV, newV, updateV]) => {
    if (filtersV || newV || updateV) {
      setTimeout(() => {
        fetchCompaniesCounterpartyList({
          ...pageFilters.value,
        });
      }, 300);
    }
  },
  {
    deep: true,
  }
);

fetchCompaniesCounterpartyList({
        ...pageFilters.value,
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full mx-auto flex justify-between">
      <div class="text-md text-nowrap text-lg">
        {{ "Контрагенты" }}
      </div>

      <div class="flex items-center gap-6">
        <UiSearch
          class="w-64"
          :placeholder="`Поиск по наименованию и ${userProfileLocalINNString}`"
          v-model="search"
        />

        <el-link :underline="false" @click="clearCounterpartiesParams"
          >Сбросить всё</el-link
        >
      </div>

      <el-button type="primary" @click="addCounterparty">
        {{ $t("views.vehicles.buttonAddCar") }}
      </el-button>
    </div>
  </Teleport>

  <TableCounterparties
    v-model:pagination="pageFilters"
    v-loading="companiesCounterpartyListLoading"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :display-columns="[
      'organization_name',
      'counterparty_type',
      'inn',
      'ogrn',
      'kpp',
      'action',
    ]"
    :items="companiesCounterpartyList"
    :totalItems="companiesCounterpartyListTotalItems"
    :empty-text="'Контрагенты не найдены'"
    :rowClassName="'cursor-pointer'"
    :loading="companiesCounterpartyListLoading"
    border
    with-pagination
    @handle-delete="onDeleteRowItem"
    @row-click="onRowClick"
  />

  <CompaniesDeleteCounterpartyModal
    v-if="modalDeleteCounterpartyVisible"
    :modal-visible="modalDeleteCounterpartyVisible"
    :item-id="selectedCounterpartyId"
    @close-modal="modalDeleteCounterpartyVisible = false"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useVehiclesRentStore } from "@/stores/vehicles";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookRent from "@/components/tables/TableReferenceBookRent.vue";

const isMounted = useMounted();
const { setReferenceBookRentCreateHash, setReferenceBookRentDetailsHash } =
  useAppStore();
const { fetchRentTemplates, clearFilters } = useVehiclesRentStore();
const {
  rentTemplates,
  rentTemplatesTotalItems,
  fetchRentTemplatesListLoading,
  createRentTemplateResponse,
  updateRentTemplateResponse,
  pageFilters,
} = storeToRefs(useVehiclesRentStore());

watch(
  [pageFilters, createRentTemplateResponse, updateRentTemplateResponse],
  ([filtersV, newTemplateV, updTemplateV]) => {
    if (filtersV || newTemplateV || updTemplateV) fetchRentTemplates(filtersV);
  },
  { deep: true, immediate: true }
);

const onRowClick = (rowItem: any) => {
  setReferenceBookRentDetailsHash(rowItem.id);
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Шаблоны аренды" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button type="primary" @click="setReferenceBookRentCreateHash">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <TableReferenceBookRent
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="rentTemplates"
    :total-items="rentTemplatesTotalItems"
    :loading="fetchRentTemplatesListLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
  />
</template>

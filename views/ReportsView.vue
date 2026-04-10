<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { ref, computed } from "vue";

import { useAppStore } from "@/stores/appStore";

import UiSearch from "@/components/ui/UiSearch.vue";
import TableReports from "@/components/tables/TableReports.vue";

const isMounted = useMounted();
const {
  setReportsRentCreateHash,
  setReportsBalanceOperationsCreateHash,
  setReportsVehicleCreateHash,
  setReportsFinesCreateHash,
} = useAppStore();
const pageFilters = ref({
  search: "",
});

const reports = ref([
  {
    description: "Отчет по штрафам",
    type: "FINES",
  },
  {
    description: "Отчет по аренде",
    type: "RENT",
  },
  {
    description: "Отчет по расчетам/операциям",
    type: "BALANCE",
  },
  {
    description: "Отчет по автомобилю",
    type: "VEHICLE",
  },
]);

const filteredReports = computed(() => {
  if (!pageFilters.value.search) return reports.value;
  return reports.value.filter((report) =>
    report.description
      .toLowerCase()
      .includes(pageFilters.value.search.toLowerCase())
  );
});

const handleRowClick = (rowItem: any) => {
  if (rowItem.type === "RENT") setReportsRentCreateHash();
  if (rowItem.type === "BALANCE") setReportsBalanceOperationsCreateHash();
  if (rowItem.type === "VEHICLE") setReportsVehicleCreateHash();
  if (rowItem.type === "FINES") setReportsFinesCreateHash();
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[808px] flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "Отчеты" }}
      </div>

      <UiSearch
        v-model="pageFilters.search"
        class="w-72"
        :placeholder="'Поиск по названию документа'"
      />
    </div>
  </Teleport>

  <div>
    <TableReports
      class="h-[calc(100vh-60px)] max-w-[808px] mx-auto flex flex-col pb-5"
      :items="filteredReports"
      :empty-text="
        pageFilters.search ? 'Ничего не найдено' : 'Отчеты не добавлены'
      "
      :rowClassName="'cursor-pointer'"
      @row-click="handleRowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { useMounted } from "@vueuse/core";
import { Close } from "@element-plus/icons-vue";

import { useTollRoadsStore } from "@/stores/tollRoadsStore";
import { useAppStore } from "@/stores/appStore";
import { formatDateToServer } from "@/helpers/format.helpers";
import type { ITollRoad, TTollRoadDatetimeType } from "@/types/tollRoads";

import TableTollRoads from "@/components/tables/TableTollRoads.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import { useHelpers } from "@/composables/useHelpers";
import ModalDownloadInvoice from "@/components/modals/ModalDownloadInvoice.vue";

const datetimeTypes: {
  name: string;
  key: TTollRoadDatetimeType;
}[] = [{ name: "дата ввода", key: "created_at" }];

const isMounted = useMounted();
const { fetchTollRoadsList, initialTollRoadsParams } = useTollRoadsStore();
const {
  tollRoadsList,
  tollRoadsListTotalItems,
  updateTollRoadResponse,
  newTollRoad,
  tollRoadsListLoading,
} = storeToRefs(useTollRoadsStore());
const { dateKeydownMask } = useHelpers();
const { setTollRoadsCreateHash, setTollRoadsDetailsHash } = useAppStore();
const pageFilters = ref({
  ...initialTollRoadsParams,
});
const daterange = ref("");
const invoiceTableColumns = ref<boolean>(false);
const selectedTollRoads = ref<string[]>([]);
const modalDownloadTollRoadsVisible = ref<boolean>(false);

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.datetime_start = formatDateToServer(v[0]);
    pageFilters.value.datetime_end = formatDateToServer(v[1]);
  } else {
    pageFilters.value.datetime_start = undefined;
    pageFilters.value.datetime_end = undefined;
  }
});

watch(
  [pageFilters, updateTollRoadResponse, newTollRoad],
  ([filtersV, updRoadV, newRoadV]) => {
    if (filtersV || updRoadV || newRoadV) {
      fetchTollRoadsList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onStatusChange = (statuses: string[]) => {
  selectedTollRoads.value = statuses;
};

const onRowClick = (rowItem: ITollRoad) => {
  setTollRoadsDetailsHash(rowItem.id);
};

const openModal = () => {
  modalDownloadTollRoadsVisible.value = true;
};

const clearFilters = () => {
  pageFilters.value = {
    ...initialTollRoadsParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{
          invoiceTableColumns
            ? "Выгрузка платежного постановления"
            : "Платные дороги"
        }}
      </div>
      <div class="flex gap-3" v-if="!invoiceTableColumns">
        <el-button class="text-[#606266]" @click="setTollRoadsCreateHash">{{
          "Добавить"
        }}</el-button>
        <el-button
          type="primary"
          style="margin: 0"
          @click="invoiceTableColumns = true"
          >{{ "Выгрузка платежного постановления" }}</el-button
        >
      </div>
      <el-icon
        v-else
        class="cursor-pointer opacity-100 hover:opacity-50"
        color="#909399"
        :size="32"
        @click="invoiceTableColumns = false"
        ><Close
      /></el-icon>
    </div>
  </Teleport>

  <div class="flex justify-between items-center w-full gap-3">
    <div class="flex items-center gap-3 w-full">
      <UiSearch
        v-model="pageFilters.query"
        class="w-56"
        :placeholder="'Поиск...'"
      />
      <el-switch class="w-fit" v-model="pageFilters.no_driver" :active-text="`Без водителя`" />
      <el-date-picker
        :clearable="false"
        v-model="daterange"
        class="max-w-[340px]"
        type="daterange"
        start-placeholder="Начало"
        end-placeholder="Конец"
        value-format="YYYY-MM-DD"
        format="DD.MM.YYYY"
        @keydown="dateKeydownMask"
      >
        <template #range-separator>до</template>
      </el-date-picker>
      <el-select v-model="pageFilters.datetime_type" style="width: 147px">
        <el-option
          v-for="item in datetimeTypes"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
      <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
    </div>
  </div>

  <TableTollRoads
    v-model:pagination="pageFilters"
    v-loading="tollRoadsListLoading"
    :invoiceTableColumns="invoiceTableColumns"
    class="h-[calc(100vh-130px)] flex flex-col pb-5 pt-5"
    :display-columns="[
      'created_at',
      'status',
      'local_status',
      'ckad_id',
      'issued_date',
      'vehicle.plate_number',
      'vehicle.brand.brand',
      'vehicle.car_model.car_model',
      'driver',
      'company_name',
      'price',
      'commission',
      'comment',
    ]"
    :sortable-columns="['created_at', 'issued_date']"
    :items="tollRoadsList"
    :totalItems="tollRoadsListTotalItems"
    :empty-text="'Платные дороги не найдены'"
    :rowClassName="'cursor-pointer'"
    :loading="tollRoadsListLoading"
    border
    with-pagination
    @row-click="onRowClick"
    @selection-change="onStatusChange"
    @open-modal="openModal"
  />

  <ModalDownloadInvoice
    v-if="modalDownloadTollRoadsVisible"
    :modal-visible="modalDownloadTollRoadsVisible"
    :selected-items="selectedTollRoads"
    :invoiceFor="`tollRoads`"
    @close-modal="modalDownloadTollRoadsVisible = false"
  />
</template>

<style scoped></style>

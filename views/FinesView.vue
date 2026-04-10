<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch, computed, onMounted } from "vue";
import { useMounted } from "@vueuse/core";

import { useFinesStore } from "@/stores/finesStore";
import { useAppStore } from "@/stores/appStore";
import { formatDateToServer } from "@/helpers/format.helpers";
import type { IFine, TFineDatetimeType } from "@/types/fines";
import { Close, Operation } from "@element-plus/icons-vue";
import ModalDownloadInvoice from "@/components/modals/ModalDownloadInvoice.vue";

import TableFines from "@/components/tables/TableFines.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import { useHelpers } from "@/composables/useHelpers";
import ModalTableColumnSettings from "@/components/modals/ModalTableColumnSettings.vue";
import { useUserStore } from "@/stores/userStore";
import type { Sort } from "element-plus";
import { ESortDirection } from "@/types/drivers";
import SelectCompanies from "@/components/select/SelectCompanies.vue";

const datetimeTypes: {
  name: string;
  key: TFineDatetimeType;
}[] = [
  { name: "дата ввода", key: "created_at" },
  { name: "дата пост-ния", key: "bill_date" },
  { name: "дата штрафа", key: "issued_date" },
];

interface Column {
  label: string;
  key: string;
  minWidth: number;
  visible: boolean;
  sortable?: boolean;
}

const {
  fetchFinesList,
  initialFinesParams,
  finesStatuses,
  finesLocalStatuses,
} = useFinesStore();
const {
  finesListTotalItems,
  finesList,
  finesListLoading,
  newFine,
  updateFineResponse,
} = storeToRefs(useFinesStore());
const { setFinesCreateHash, setFinesDetailsHash } = useAppStore();
const isMounted = useMounted();
const { dateKeydownMask } = useHelpers();
const pageFilters = ref({
  ...initialFinesParams,
});
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

const daterange = ref("");
const bankClientTableColumns = ref<boolean>(false);
const selectedFines = ref<string[]>([]);
const modalDownloadFinesVisible = ref<boolean>(false);
const modalTableSettings = ref<boolean>(false);
const searchLocalStatuses = computed(() => {
  return [...finesLocalStatuses, { key: "not_accrued", label: "Не начислен" }];
});

const columnsStatic = ref([
  { label: "Дата ввода", key: "created_at", minWidth: 142, visible: true },
  { label: "Источник", key: "source", minWidth: 142, visible: true },
  {
    label: "Собственник а/м",
    key: "vehicle.counterparty.full_name",
    minWidth: 142,
    visible: true,
  },
]);
const columnsDraggableRaw = ref([
  { label: "Статус в ГИБДД", key: "status", minWidth: 152, visible: true },
  {
    label: "Статус водителя",
    key: "local_status",
    minWidth: 152,
    visible: true,
  },
  {
    label: "Дней до передачи в ФССП",
    key: "days_to_bailiffs",
    minWidth: 79,
    visible: true,
    sortable: true,
  },
  { label: "Номер постановления", key: "number", minWidth: 195, visible: true },
  {
    label: "Дата постановления",
    key: "bill_date",
    minWidth: 188,
    visible: true,
  },
  { label: "Дата штрафа", key: "issued_date", minWidth: 142, visible: true },
  {
    label: "Гос. номер",
    key: "vehicle.plate_number",
    minWidth: 107,
    visible: true,
  },
  { label: "Марка", key: "vehicle.brand.brand", minWidth: 149, visible: true },
  {
    label: "Модель",
    key: "vehicle.car_model.car_model",
    minWidth: 149,
    visible: true,
  },
  { label: "Водитель", key: "driver", minWidth: 305, visible: true },
  { label: "Эксплуатант", key: "company_name", minWidth: 305, visible: true },
  {
    label: `Штраф,${userProfileLocalCurrencySymbol.value}`,
    key: "price",
    minWidth: 100,
    visible: true,
  },
  {
    label: `Со скидкой,${userProfileLocalCurrencySymbol.value}`,
    key: "discount_price",
    minWidth: 122,
    visible: true,
  },
  {
    label: "Скидка до",
    key: "discount_expires_at",
    minWidth: 142,
    visible: true,
  },
  {
    label: `Комиссия,${userProfileLocalCurrencySymbol.value}`,
    key: "commission",
    minWidth: 111,
    visible: true,
  },
  { label: "Примечание", key: "comment", minWidth: 305, visible: true },
]);

const columnsDraggable = computed(() =>
  columnsDraggableRaw.value.map((col) => {
    if (["price", "discount_price", "commission"].includes(col.key)) {
      return {
        ...col,
        label: `${col.label.split(",")[0]}, ${userProfileLocalCurrencySymbol.value}`,
      };
    }
    return col;
  })
);

const editColumnsHandler = (columns: Column[]) => {
  columnsDraggableRaw.value = [...columns];
  localStorage.setItem("finesColumns", JSON.stringify([...columns]));
};

const columnsEdited = computed(() => {
  return [...columnsStatic.value, ...columnsDraggable.value];
});

const onSortChange = (v: Sort) => {
  pageFilters.value = {
    ...pageFilters.value,
    order_by: v.prop,
    direction:
      v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
  };
};

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
  [pageFilters, newFine, updateFineResponse],
  ([filtersV, newFineV, updateV]) => {
    if (filtersV || newFineV || updateV) {
      fetchFinesList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onStatusChange = (statuses: string[]) => {
  selectedFines.value = statuses;
};

const onRowClick = (rowItem: IFine) => {
  setFinesDetailsHash(rowItem.id);
};

const openModal = () => {
  modalDownloadFinesVisible.value = true;
};

const clearFilters = () => {
  pageFilters.value = {
    ...initialFinesParams,
  };
  daterange.value = "";
};

onMounted(() => {
  const stored = localStorage.getItem("finesColumns");
  if (stored) {
    const saved = JSON.parse(stored) as Column[];
    const currentMap = new Map(columnsDraggable.value.map((c) => [c.key, c]));

    const updated = saved
      .filter((col) => currentMap.has(col.key))
      .map((col) => {
        const current = currentMap.get(col.key)!;
        return { ...current, ...col };
      });

    const savedKeys = new Set(saved.map((c) => c.key));
    const newColumns = columnsDraggable.value.filter(
      (c) => !savedKeys.has(c.key)
    );

    columnsDraggableRaw.value = [...updated, ...newColumns];
  }
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-xl">
      {{ bankClientTableColumns ? "Выгрузка в банк-клиент" : "Штрафы ПДД" }}
    </div>
    <el-link
      v-if="!bankClientTableColumns"
      :icon="Operation"
      class="ml-5 mx-auto gap-2 pb-1"
      :underline="false"
      type="primary"
      @click="modalTableSettings = true"
      >Настроить колонки</el-link
    >

    <div class="flex gap-3" v-if="!bankClientTableColumns">
      <el-button class="text-[#606266]" @click="setFinesCreateHash">
        {{ "Добавить штраф" }}
      </el-button>
      <el-button
        type="primary"
        style="margin: 0"
        @click="bankClientTableColumns = true"
        >{{ "Выгрузка в банк-клиент" }}</el-button
      >
    </div>
    <el-icon
      v-else
      class="cursor-pointer opacity-100 hover:opacity-50"
      color="#909399"
      :size="32"
      @click="bankClientTableColumns = false"
      ><Close
    /></el-icon>
  </Teleport>

  <div class="flex justify-between w-full gap-3">
    <div class="flex flex-col gap-3 w-full">
      <div class="flex gap-3">
        <div class="flex flex-col gap-2">
          <p class="text-sm">Поиск</p>
          <UiSearch
            v-model="pageFilters.query"
            class="flex-grow max-w-[200px]"
            :placeholder="'Поиск'"
          />
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm">Статус в ГИБДД</p>
          <el-select
            v-model="pageFilters.statuses"
            class="w-40"
            placeholder="Не выбран"
            clearable
            multiple
            collapse-tags
          >
            <el-option
              v-for="item in finesStatuses"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm">Статус водителя</p>
          <el-select
            v-model="pageFilters.local_statuses"
            class="w-40"
            placeholder="Не выбран"
            clearable
            multiple
            collapse-tags
          >
            <el-option
              v-for="item in searchLocalStatuses"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm">Период</p>
          <el-date-picker
            v-model="daterange"
            class="max-w-[310px]"
            type="daterange"
            start-placeholder="Начало"
            end-placeholder="Конец"
            value-format="YYYY-MM-DD"
            format="DD.MM.YYYY"
            @keydown="dateKeydownMask"
          >
            <template #range-separator>до</template>
          </el-date-picker>
        </div>
      </div>
      <div class="flex gap-3">
        <div class="flex flex-col gap-2">
          <p class="text-sm">Собственник</p>
          <SelectCompanies
            v-model="pageFilters.counterparty_id"
            type="counterparty"
            withOrganizationForm
          />
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-sm">Без водителя</p>
          <el-switch
            class="w-fit"
            v-model="pageFilters.no_driver"
          />
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-sm"><br /></p>
          <el-select v-model="pageFilters.datetime_type" style="width: 147px">
            <el-option
              v-for="item in datetimeTypes"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </div>
      </div>
    </div>
    <el-link
      class="ml-auto min-w-[100px]"
      :underline="false"
      @click="clearFilters"
      >Сбросить всё</el-link
    >
  </div>

  <TableFines
    v-model:pagination="pageFilters"
    v-loading="finesListLoading"
    class="h-[calc(100vh-200px)] flex flex-col pb-5 pt-5"
    :items="finesList"
    :columnsEdit="columnsEdited"
    :totalItems="finesListTotalItems"
    :empty-text="'Штрафы не найдены'"
    :rowClassName="'cursor-pointer'"
    :loading="finesListLoading"
    :bankClientTableColumns="bankClientTableColumns"
    border
    with-pagination
    @row-click="onRowClick"
    @selection-change="onStatusChange"
    @open-modal="openModal"
    @sort-change="onSortChange"
  />

  <ModalDownloadInvoice
    v-if="modalDownloadFinesVisible"
    :modal-visible="modalDownloadFinesVisible"
    :selected-items="selectedFines"
    :invoiceFor="`fines`"
    @close-modal="modalDownloadFinesVisible = false"
  />

  <ModalTableColumnSettings
    v-if="modalTableSettings"
    :modal-visible="modalTableSettings"
    @close-modal="modalTableSettings = false"
    :columnsStatic="columnsStatic"
    :columnsDraggable="columnsDraggable"
    @editColumnsHandler="editColumnsHandler"
  />
</template>

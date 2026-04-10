<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { useI18n } from "vue-i18n";

import { useDriversStore } from "@/stores/driversStore";
import { useDraftsStore } from "@/stores/draftsStore";
import { useAppStore } from "@/stores/appStore";

import TableDrivers from "@/components/tables/TableDrivers.vue";
import TableDriversImport from "@/components/tables/TableDriversImport.vue";
import TableIntegrationsImport from "@/components/tables/TableIntegrationsImport.vue";
import UiSearch from "@/components/ui/UiSearch.vue";

import {
  EDriverStatus,
  ESortDirection,
  type IDriversListParams,
} from "@/types/drivers";
import { type IDraftListParams } from "@/types/drafts";
import type { Sort } from "element-plus";
import ModalTableColumnSettings from "@/components/modals/ModalTableColumnSettings.vue";
import ModalIntegrationsImportAdd from "@/components/modals/ModalIntegrationsImportAdd.vue";
import type { TBalanceOperationsCategory } from "@/types/balanceOperations";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { Operation, Download } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/userStore";
import { useUserAbility } from "@/composables/useUser";
import {
  useIntegrationsImportStore,
  useIntegrationsStore,
} from "@/stores/integrationsStore";
import type { IIntegrationImportStatusesParams } from "@/types/integrations";

interface Column {
  label: string;
  key: string;
  minWidth: number;
  visible: boolean;
  sortable?: boolean;
}

const isMounted = useMounted();
const { t } = useI18n();
const { setDriversCreateHash, setDriversDetailsHash } = useAppStore();
const {
  fetchDrivers,
  setDriverDraftData,
  downloadDrivers,
  clear: clearDraftData,
} = useDriversStore();
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const { categoriesList, getBalanceOperationCategory } = useBalanceOperations();
const {
  fetchDriversLoading,
  drivers,
  newDriver,
  updateDriverResponse,
  driversTotalItems,
  updateDriverStatusResponse,
} = storeToRefs(useDriversStore());
const { fetchDraftsList } = useDraftsStore();
const {
  selectedDraftDriver,
  newDraft,
  updateDraftResponse,
  draftsListLoading,
  driversDraftList,
  draftTotalItems,
} = storeToRefs(useDraftsStore());
const { can } = useUserAbility();
const {
  integrationsImportFilters,
  integrationsImportList,
  integrationsImportTotalItems,

  integrationImportTasksLoading,

  draftsImportListLoading,
  driversDraftImportList,
  draftImportTotalItems,

  createIntegrationsResponse,
  isImportedDraft
} = storeToRefs(useIntegrationsImportStore());
const {
  startIntegrationPolling,
  stopIntegrationPolling,
  fetchDraftsImportList,
} = useIntegrationsImportStore();
const { fetchIntegrationsRequest } = useIntegrationsStore();

const fetchDriversParams = ref<IDriversListParams>({
  limit: 20,
  page: 1,
  query: "",
  statuses: undefined,
  order_by: "created_at",
  direction: ESortDirection.desc,
});
let draftListParams = reactive<IDraftListParams>({
  limit: 20,
  page: 1,
  query: "",
  draft_type: "driver",
  source: "internal",
});
let draftImportListParams = reactive<IDraftListParams>({
  limit: 20,
  page: 1,
  query: "",
  draft_type: "driver",
  source: "yandex",
});
let integrationsListParams = reactive<IIntegrationImportStatusesParams>({
  limit: 20,
  page: 1,
  status: ["pending", "in_progress", "done", "failed"],
  type: ["driver"],
});

type TTab = "drivers" | "drafts" | "integrations" | "imported";
const activeTab = ref<TTab>("drivers");

const modalTableSettings = ref<boolean>(false);
const openIntegrationModal = ref<boolean>(false);

const columnsStatic = ref([
  {
    label: t("views.drivers.tableRows.driver"),
    key: "lastname",
    minWidth: 350,
    visible: true,
  },
  {
    label: t("views.drivers.tableRows.status"),
    key: "status",
    minWidth: 120,
    visible: true,
    sortable: false,
  },
]);

const addSortedColumns = computed(() => {
  const unallocatedFunds: TBalanceOperationsCategory = "unallocated_funds";
  return [
    unallocatedFunds,
    ...categoriesList.value.filter((v) => v !== unallocatedFunds),
  ];
});

const columnsDraggable = ref([
  {
    label: t("views.drivers.tableRows.changes"),
    key: "created_at",
    minWidth: 150,
    visible: true,
    sortable: true,
  },
  {
    label: t("views.drivers.tableRows.number"),
    key: "id",
    minWidth: 80,
    visible: true,
  },
  {
    label: t("views.drivers.tableRows.citizenship"),
    key: "citizenship",
    minWidth: 134,
    visible: true,
  },
  {
    label: t("views.drivers.tableRows.category"),
    key: "category",
    minWidth: 142,
    visible: true,
  },
  {
    label: t("views.drivers.tableRows.taxStatus"),
    key: "tax_status",
    minWidth: 173,
    visible: true,
  },
  {
    label: t("views.drivers.tableRows.licenceDate"),
    key: "licence_expire_date",
    minWidth: 101,
    visible: true,
    sortable: true,
  },
  {
    label: `Баланс, ${userProfileLocalCurrencySymbol.value}`,
    key: "balance",
    minWidth: 120,
    visible: true,
    sortable: true,
  },
  {
    label: `Баланс в агрегаторах, ${userProfileLocalCurrencySymbol.value}`,
    key: "balance_external",
    minWidth: 120,
    visible: true,
    sortable: true,
  },
]);

const statusesList = [
  {
    key: EDriverStatus.hired,
    label: "Принят",
  },
  {
    key: EDriverStatus.applicant,
    label: "Претендент",
  },
  {
    key: EDriverStatus.under_inspection,
    label: "На проверке",
  },
  {
    key: EDriverStatus.refused,
    label: "Отказ",
  },
  {
    key: EDriverStatus.fired,
    label: "Уволен",
  },
];

watch(addSortedColumns, (newCategories) => {
  const categoryColumns = newCategories.map((category) => ({
    label: getBalanceOperationCategory(category),
    key: category,
    minWidth: 120,
    visible: true,
    sortable: true,
  }));

  columnsDraggable.value = [
    ...columnsDraggable.value,
    ...categoryColumns,
    {
      label: t("views.drivers.tableRows.comment"),
      key: "comment",
      minWidth: 235,
      visible: true,
      sortable: false,
    },
  ];
});

const columnsEdited = computed(() => {
  return [...columnsStatic.value, ...columnsDraggable.value];
});

const editColumnsHandler = (columns: Column[]) => {
  columnsDraggable.value = [...columns];
  localStorage.setItem("driverColumns", JSON.stringify([...columns]));
};

const tableSort = computed<Sort>(() => ({
  prop: fetchDriversParams.value.order_by ?? "created_at",
  order:
    fetchDriversParams.value.direction === "asc" ? "ascending" : "descending",
}));

const clearFilters = () => {
  if (activeTab.value === "drivers") {
    fetchDriversParams.value = {
      ...fetchDriversParams.value,
      query: "",
      statuses: undefined,
    };
  }
  if (activeTab.value === "drafts") {
    draftListParams.query = "";
    draftListParams.page = 1;
  }
  if (activeTab.value === "imported") {
    draftImportListParams.query = "";
    draftImportListParams.page = 1;
  }
};

watch(
  [
    newDriver,
    updateDriverResponse,
    updateDriverStatusResponse,
    fetchDriversParams,
    createIntegrationsResponse,
  ],
  ([
    newDriverValue,
    updateDriverResponseValue,
    updateDriverStatusResponse,
    params,
    createImport,
  ]) => {
    if (
      newDriverValue ||
      updateDriverResponseValue ||
      updateDriverStatusResponse ||
      params ||
      createImport
    ) {
      fetchDrivers(fetchDriversParams.value);
    }
  },
  { deep: true }
);

watch(
  [newDraft, updateDraftResponse, draftListParams],
  ([newDraftValue, updateDraftResponseValue, paramsValue]) => {
    if (newDraftValue || updateDraftResponseValue || paramsValue) {
      fetchDraftsList(draftListParams);
    }
  }
);

watch([draftImportListParams], ([paramsValue]) => {
  if (paramsValue) {
    fetchDraftsImportList(draftImportListParams);
  }
});

watch(
  () => activeTab.value,
  async (tab) => {
    if (tab === "integrations") {
      startIntegrationPolling(integrationsListParams);
    } else {
      stopIntegrationPolling();
    }
    if (tab === "drafts") {
      fetchDraftsList(draftListParams);
    }

    if (tab === "imported") {
      clearDraftData();
    }
  },
  { deep: true }
);

const downloadDriversHandler = async () => {
  downloadDrivers(fetchDriversParams.value);
};

const onRowClick = (row: any) => {
  setDriversDetailsHash(row.id);
};
const onDraftRowClick = (row: any) => {
  console.log(row);
  if (activeTab.value === "imported") {
    isImportedDraft.value = true;
  } else {
    isImportedDraft.value = false;
  }

  selectedDraftDriver.value = { ...row };
  setDriverDraftData(row);
  setDriversCreateHash();
};
const onSortChange = (v: Sort) => {
  console.log(v.prop);
  const isCategoryKey = categoriesList.value.includes(v.prop);
  const lineName = isCategoryKey ? `balance_${v.prop}` : v.prop;
  fetchDriversParams.value = {
    ...fetchDriversParams.value,
    order_by: lineName,
    direction:
      v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
  };
};

const refreshDraftImports = async () => {
  await fetchDraftsImportList(draftImportListParams);
};

onMounted(async () => {
  await fetchDrivers(fetchDriversParams.value);
  fetchDraftsList(draftListParams);
  await fetchDraftsImportList(draftImportListParams);
  await fetchIntegrationsRequest({
    page: 1,
    limit: 0,
  });

  const categoryColumns = addSortedColumns.value.map((category) => ({
    label: getBalanceOperationCategory(category),
    key: category,
    minWidth: 120,
    visible: true,
    sortable: true,
  }));

  const commentColumn = {
    label: t("views.drivers.tableRows.comment"),
    key: "comment",
    minWidth: 235,
    visible: true,
    sortable: false,
  };

  const dynamicColumns = [...categoryColumns, commentColumn];

  columnsDraggable.value = [...columnsDraggable.value, ...dynamicColumns];

  const currentMap = new Map(columnsDraggable.value.map((c) => [c.key, c]));

  const stored = localStorage.getItem("driverColumns");
  if (stored) {
    const saved = JSON.parse(stored) as Column[];

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

    columnsDraggable.value = [...updated, ...newColumns];
  }
});

const searchQuery = computed({
  get() {
    switch (activeTab.value) {
      case "drivers":
        return fetchDriversParams.value.query;
      case "drafts":
        return draftListParams.query;
      case "imported":
        return draftImportListParams.query;
      default:
        return "";
    }
  },
  set(value: string) {
    switch (activeTab.value) {
      case "drivers":
        fetchDriversParams.value.query = value;
        break;
      case "drafts":
        draftListParams.query = value;
        break;
      case "imported":
        draftImportListParams.query = value;
        break;
    }
  },
});

onBeforeUnmount(() => {
  stopIntegrationPolling();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="text-md text-nowrap text-lg">
      {{ $t("views.drivers.title") }}
      <el-link
        :icon="Operation"
        class="ml-5 mx-auto gap-2 pb-1"
        :underline="false"
        type="primary"
        @click="modalTableSettings = true"
        >Настроить колонки</el-link
      >
    </div>

    <div class="flex items-center gap-3">
      <UiSearch
        v-model="searchQuery"
        class="w-[228px] shrink-0"
        :placeholder="$t('views.drivers.searchPlaceholder')"
      />
      <el-select
        v-if="activeTab === 'drivers'"
        class="w-[228px] shrink-0"
        v-model="fetchDriversParams.statuses"
        placeholder="Статус водителя"
      >
        <el-option
          v-for="item in statusesList"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-link
        class="inline-flex w-auto"
        @click="clearFilters"
        :underline="false"
      >
        {{ $t("views.drivers.clearLink") }}</el-link
      >
    </div>

    <div>
      <el-button
        v-if="can('create', 'Driver')"
        @click="setDriversCreateHash"
        type="primary"
        >{{ $t("views.drivers.btnAdd") }}</el-button
      >
      <el-button type="default" @click="downloadDriversHandler">
        <el-icon><Download /></el-icon>
      </el-button>
    </div>
  </Teleport>

  <div class="h-[calc(100vh-110px)] flex flex-col gap-2.5">
    <el-radio-group v-model="activeTab" class="w-fit">
      <el-radio-button label="Водители" value="drivers" />
      <el-radio-button label="Черновики" value="drafts" />
      <el-radio-button label="Импортированные водители" value="imported" />
      <el-radio-button label="Импорт" value="integrations" />
    </el-radio-group>
    <TableDrivers
      v-if="activeTab === 'drivers'"
      v-model:pagination="fetchDriversParams"
      v-loading="fetchDriversLoading"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :columnsEdit="columnsEdited"
      :items="drivers"
      :totalItems="driversTotalItems"
      :empty-text="'Водители не добавлены'"
      :rowClassName="'cursor-pointer'"
      :loading="fetchDriversLoading"
      :table-sort="tableSort"
      border
      with-pagination
      @row-click="onRowClick"
      @sort-change="onSortChange"
    />

    <TableDrivers
      v-if="activeTab === 'drafts'"
      v-model:pagination="draftListParams"
      v-loading="draftsListLoading"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :columnsEdit="columnsEdited"
      :items="driversDraftList"
      :totalItems="draftTotalItems"
      :empty-text="'Нет черновиков'"
      :rowClassName="'cursor-pointer'"
      :loading="draftsListLoading"
      border
      with-pagination
      @row-click="onDraftRowClick"
    />

    <TableDriversImport
      v-if="activeTab === 'imported'"
      v-model:pagination="draftImportListParams"
      v-loading="draftsImportListLoading"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :items="driversDraftImportList"
      :totalItems="draftImportTotalItems"
      :empty-text="'Нет черновиков'"
      :rowClassName="'cursor-pointer'"
      :loading="draftsImportListLoading"
      border
      with-pagination
      @row-click="onDraftRowClick"
      @refresh="refreshDraftImports"
    />

    <div v-if="activeTab === 'integrations'" class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <div class="text-lg font-medium">Интеграции с агрегаторами</div>
        <el-button type="default" @click="openIntegrationModal = true">
          <span class="flex items-center gap-2">
            <el-icon><Download /></el-icon>
            Импортировать
          </span>
        </el-button>
      </div>

      <TableIntegrationsImport
        v-model:pagination="integrationsListParams"
        :loading="integrationImportTasksLoading"
        class="h-[calc(100vh-60px)] flex flex-col pb-5"
        :items="integrationsImportList"
        :total-items="integrationsImportTotalItems"
        :empty-text="'Интеграции не найдены'"
        border
        with-pagination
      />
    </div>
  </div>

  <ModalTableColumnSettings
    v-if="modalTableSettings"
    :modal-visible="modalTableSettings"
    @close-modal="modalTableSettings = false"
    :columnsStatic="columnsStatic"
    :columnsDraggable="columnsDraggable"
    @editColumnsHandler="editColumnsHandler"
  />

  <ModalIntegrationsImportAdd
    v-if="openIntegrationModal"
    :modal-visible="openIntegrationModal"
    :params="integrationsListParams"
    type="drivers"
    @close-modal="openIntegrationModal = false"
  />
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
:deep(.el-radio-button.is-active) {
  .el-radio-button__inner {
    background: rgba(165, 98, 255, 0.15) !important;
    color: #a562ff !important;
    box-shadow: none;
  }
}
</style>

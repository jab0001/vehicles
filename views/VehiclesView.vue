<script lang="ts" setup>
import dayjs from "dayjs";
import {
  onMounted,
  ref,
  watch,
  reactive,
  computed,
  onBeforeUnmount,
} from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useAppStore } from "@/stores/appStore";
import { useVehicleGroupsStore, useVehiclesStore } from "@/stores/vehicles";
import { useDraftsStore } from "@/stores/draftsStore";
import type { IFetchVehiclesParams } from "@/types/vehicles";
import { type IDraftListParams } from "@/types/drafts";

import TableVehicles from "@/components/tables/TableVehicles.vue";
import TableIntegrationsImport from "@/components/tables/TableIntegrationsImport.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import ModalTableColumnSettings from "@/components/modals/ModalTableColumnSettings.vue";
import ModalIntegrationsImportAdd from "@/components/modals/ModalIntegrationsImportAdd.vue";
import { Operation, Download } from "@element-plus/icons-vue";
import { useUser, useUserAbility } from "@/composables/useUser";
import { useUserStore } from "@/stores/userStore";
import {
  useIntegrationsImportStore,
  useIntegrationsStore,
} from "@/stores/integrationsStore";
import type { IIntegrationImportStatusesParams } from "@/types/integrations";
import TableVehiclesImport from "@/components/tables/TableVehiclesImport.vue";

interface Column {
  label: string;
  key: string;
  minWidth: number;
  visible: boolean;
  sortable?: boolean;
}

const { vehicleGroups } = storeToRefs(useVehicleGroupsStore());
const { fetchVehicleGroups } = useVehicleGroupsStore();
const {
  vehicles,
  isFetchVehiclesLoading,
  createVehicleResponse,
  updateVehicleResponse,
  vehicleTotalItems,
} = storeToRefs(useVehiclesStore());
const {
  fetchVehicles,
  setVehiclesFormsData,
  downloadVehicles,
  clear: clearVehicleImportedFormData,
} = useVehiclesStore();
const { setVehiclesCreateHash, setVehiclesDetailsHash } = useAppStore();
const { fetchDraftsList } = useDraftsStore();
const { can } = useUserAbility();
const {
  selectedDraftVehicle,
  newDraft,
  updateDraftResponse,
  draftsListLoading,
  vehiclesDraftList,
  draftTotalItems,
} = storeToRefs(useDraftsStore());
const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const {
  integrationsImportFilters,
  integrationsImportList,
  integrationsImportTotalItems,

  integrationImportTasksLoading,

  draftsImportListLoading,
  vehiclesDraftImportList,
  draftImportTotalItems,

  createIntegrationsResponse,

  isImportedDraft,
} = storeToRefs(useIntegrationsImportStore());
const {
  startIntegrationPolling,
  stopIntegrationPolling,
  fetchDraftsImportList,
} = useIntegrationsImportStore();
const { fetchIntegrationsRequest } = useIntegrationsStore();

const DEFAULT_VEHICLE_PARAMS: IFetchVehiclesParams = {
  company_ids: currentCompaniesIdsList.value,
  limit: 20,
  page: 1,
  order_by: "created_at",
  direction: "desc",
  query: "",
  company_units: [],
  disposal: false,
};
const modalTableSettings = ref<boolean>(false);
const openIntegrationModal = ref<boolean>(false);
const vehicleParams = ref<IFetchVehiclesParams>({ ...DEFAULT_VEHICLE_PARAMS });
let draftVehicleParams = reactive<IDraftListParams>({
  limit: 20,
  page: 1,
  draft_type: "vehicle",
  source: "internal",
});
let draftImportVehicleParams = reactive<IDraftListParams>({
  limit: 20,
  page: 1,
  draft_type: "vehicle",
  source: "yandex",
});
let integrationsListParams = reactive<IIntegrationImportStatusesParams>({
  limit: 20,
  page: 1,
  status: ["pending", "in_progress", "done", "failed"],
  type: ["vehicle"],
});

type TTab = "current" | "disposal" | "drawer" | "integrations" | "imported";
const activeTab = ref<TTab>("current");
const isMounted = useMounted();
const columnsStatic = computed(() => {
  const result = [
    { label: "Гос. Номер", key: "plate_number", minWidth: 240, visible: true },
    { label: "Марка", key: "brand", minWidth: 108, visible: true },
    { label: "Модель", key: "car_model", minWidth: 108, visible: true },
  ];

  if (activeTab.value === "disposal") {
    result.push(
      {
        label: "Дата списания",
        key: "disposal_date",
        minWidth: 150,
        visible: true,
      },
      {
        label: "Причина списания",
        key: "disposal_reason",
        minWidth: 200,
        visible: true,
      }
    );
  }

  return result;
});
const columnsDraggable = ref([
  { label: "Класс", key: "vehicle_type", minWidth: 100, visible: true },
  { label: "Группа", key: "company_unit", minWidth: 100, visible: true },
  { label: "Цвет", key: "color", minWidth: 100, visible: true },
  {
    label: `Аренда, ${userProfileLocalCurrencySymbol.value}`,
    key: "rent_amount",
    minWidth: 100,
    visible: true,
  },
  { label: "Пробег, км", key: "current_mileage", minWidth: 100, visible: true },
  {
    label: "ТО через",
    key: "next_inspection_mileage",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "ОСАГО",
    key: "osago",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "КАСКО",
    key: "kasko",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "ОСГОП",
    key: "osgop",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "Техосмотр",
    key: "last_diagnostic_card",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "Лицензия",
    key: "licence_expires_at",
    minWidth: 122,
    visible: true,
    sortable: false,
  },
  {
    label: "Осмотр в парке через",
    key: "next_inspection_weekly",
    minWidth: 220,
    visible: true,
    sortable: false,
  },
  {
    label: "Мобильный осмотр через",
    key: "next_inspection_mobile",
    minWidth: 200,
    visible: true,
    sortable: false,
  },
]);

const columnsEdited = computed(() => {
  return [...columnsStatic.value, ...columnsDraggable.value];
});

const editColumnsHandler = (columns: Column[]) => {
  columnsDraggable.value = [...columns];
  localStorage.setItem("vehicleColumns", JSON.stringify([...columns]));
};

watch(activeTab, async (newTab) => {
  if (newTab === "current") {
    vehicleParams.value.disposal = false;
  }
  if (newTab === "disposal") {
    vehicleParams.value.disposal = true;
  }
  if (newTab === "drawer") {
    fetchDraftsList(draftVehicleParams);
  }
  if (newTab === "integrations") {
    startIntegrationPolling(integrationsListParams);
  } else {
    stopIntegrationPolling();
  }
  if (newTab === "imported") {
    clearVehicleImportedFormData();
  }
});

watch(
  [
    createVehicleResponse,
    updateVehicleResponse,
    vehicleParams,
    createIntegrationsResponse,
  ],
  ([createV, updateV, paramsV, importV]) => {
    if (createV || updateV || paramsV || importV) {
      fetchVehicles(vehicleParams.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
watch(
  [newDraft, updateDraftResponse, draftVehicleParams],
  ([newDraftValue, updateDraftResponseValue, paramsValue]) => {
    if (newDraftValue || updateDraftResponseValue || paramsValue) {
      fetchDraftsList(draftVehicleParams);
    }
  }
);
watch([draftImportVehicleParams], ([paramsValue]) => {
  if (paramsValue) {
    fetchDraftsImportList(draftImportVehicleParams);
  }
});

const onDraftRowClick = (row: any) => {
  console.log(row);
  if (activeTab.value === "imported") {
    isImportedDraft.value = true;
  } else {
    isImportedDraft.value = false;
  }
  selectedDraftVehicle.value = { ...row };
  setVehiclesFormsData(row);
  setVehiclesCreateHash();
};

const openCreateVehicleDrawer = () => {
  setVehiclesCreateHash();
};
const onRowClick = (rowItem: any) => {
  setVehiclesDetailsHash(rowItem.id);
};
const clearVehicleParams = () => {
  if (activeTab.value === "current" || activeTab.value === "disposal") {
    vehicleParams.value = { ...DEFAULT_VEHICLE_PARAMS };
  }
  if (activeTab.value === "drawer") {
    draftVehicleParams.query = "";
    draftVehicleParams.page = 1;
  }
  if (activeTab.value === "imported") {
    draftImportVehicleParams.query = "";
    draftImportVehicleParams.page = 1;
  }

  /* activeTab.value = "current"; */
};
const isLineStatus = computed({
  get: () => vehicleParams.value.is_on_line,
  set: (value: boolean | undefined) => {
    vehicleParams.value.is_on_line = value;
  },
});

const toggleLineStatus = (status: boolean | undefined) => {
  vehicleParams.value.is_on_line = status;
};

const downloadVehiclesHandler = async () => {
  downloadVehicles(vehicleParams.value);
};

const refreshDraftImports = async () => {
  await fetchDraftsImportList(draftImportVehicleParams);
};

const searchQuery = computed({
  get() {
    switch (activeTab.value) {
      case "current":
        return vehicleParams.value.query;
      case "disposal":
        return vehicleParams.value.query;
      case "drawer":
        return draftVehicleParams.query;
      case "imported":
        return draftImportVehicleParams.query;
      default:
        return "";
    }
  },
  set(value: string) {
    switch (activeTab.value) {
      case "current":
        vehicleParams.value.query = value;
        break;
      case "disposal":
        vehicleParams.value.query = value;
        break;
      case "drawer":
        draftVehicleParams.query = value;
        break;
      case "imported":
        draftImportVehicleParams.query = value;
        break;
    }
  },
});

onMounted(async () => {
  fetchDraftsList(draftVehicleParams);
  fetchDraftsImportList(draftImportVehicleParams);
  fetchVehicleGroups({
    company_id: currentCompanyId.value,
  });
  await fetchIntegrationsRequest({
    page: 1,
    limit: 0,
  });

  const stored = localStorage.getItem("vehicleColumns");
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

    columnsDraggable.value = [...updated, ...newColumns];
  }
});

onBeforeUnmount(() => {
  stopIntegrationPolling();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ $t("views.vehicles.title") }}
        <el-link
          :icon="Operation"
          class="ml-5 mx-auto gap-2 pb-1"
          :underline="false"
          type="primary"
          @click="modalTableSettings = true"
          >Настроить колонки</el-link
        >
      </div>
      <div class="flex items-center gap-6">
        <UiSearch
          v-model="searchQuery"
          class="w-64"
          placeholder="Поиск по а/м и владельцу"
        />
        <el-select
          v-if="activeTab === 'current' || activeTab === 'disposal'"
          v-model="vehicleParams.company_units"
          placeholder="Выберите группу"
          clearable
          multiple
          collapse-tags
          class="w-40"
        >
          <el-option
            v-for="item in vehicleGroups"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-link :underline="false" @click="clearVehicleParams"
          >Сбросить всё</el-link
        >
      </div>

      <div>
        <el-button
          v-if="can('create', 'Vehicle')"
          type="primary"
          @click="openCreateVehicleDrawer"
        >
          {{ $t("views.vehicles.buttonAddCar") }}
        </el-button>

        <el-button type="default" @click="downloadVehiclesHandler">
          <el-icon><Download /></el-icon>
        </el-button>
      </div>
    </div>
  </Teleport>

  <div class="h-[calc(100vh-130px)] flex flex-col gap-2.5">
    <div>
      <el-form-item label="">
        <el-radio-group v-model="activeTab">
          <el-radio-button label="current" class="custom-btn">
            Текущий парк
          </el-radio-button>
          <el-radio-button label="disposal" class="custom-btn">
            Выведены из эксплуатации
          </el-radio-button>
          <el-radio-button label="drawer" class="custom-btn">
            Черновики
          </el-radio-button>
          <el-radio-button label="imported" class="custom-btn">
            Импортированные авто
          </el-radio-button>
          <el-radio-button label="integrations" class="custom-btn">
            Импорт
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-checkbox
        v-if="activeTab === 'current' || activeTab === 'disposal'"
        :model-value="isLineStatus === true"
        @change="toggleLineStatus(true)"
        label="На линии"
        size="large"
      />
      <el-checkbox
        v-if="activeTab === 'current' || activeTab === 'disposal'"
        :model-value="isLineStatus === false"
        @change="toggleLineStatus(false)"
        label="Снят с линии"
        size="large"
      />
    </div>

    <TableVehicles
      v-if="activeTab === 'current' || activeTab === 'disposal'"
      v-model:pagination="vehicleParams"
      v-loading="isFetchVehiclesLoading"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :items="vehicles"
      :columnsEdit="columnsEdited"
      :totalItems="vehicleTotalItems"
      :empty-text="'Автомобили не добавлены'"
      :rowClassName="'cursor-pointer'"
      :loading="isFetchVehiclesLoading"
      border
      with-pagination
      @row-click="onRowClick"
    />

    <TableVehicles
      v-if="activeTab === 'drawer'"
      v-model:pagination="draftVehicleParams"
      v-loading="draftsListLoading"
      :columnsEdit="columnsEdited"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :items="vehiclesDraftList"
      :totalItems="draftTotalItems"
      :empty-text="'Нет черновиков'"
      :rowClassName="'cursor-pointer'"
      :loading="draftsListLoading"
      border
      with-pagination
      @row-click="onDraftRowClick"
    />

    <TableVehiclesImport
      v-if="activeTab === 'imported'"
      v-model:pagination="draftImportVehicleParams"
      v-loading="draftsImportListLoading"
      class="h-[calc(100vh-110px)] flex flex-col flex-1 pb-5"
      :items="vehiclesDraftImportList"
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
    type="vehicles"
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

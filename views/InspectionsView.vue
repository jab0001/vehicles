<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { Expand, RefreshRight } from "@element-plus/icons-vue";

import { useAppStore } from "@/stores/appStore";
import { useInspectionsStore } from "@/stores/inspections";
import { useAppBreakpoints } from "@/composables/useApp";
import { useDraftsStore } from "@/stores/draftsStore";

import {
  InspectionSignatureStatusType,
  type IInspections,
  type IInspectionSettingsFetchParams,
  type IInspectionsFetchParams,
} from "@/types/inspections";
import { type IDraftListParams } from "@/types/drafts";

import TableInspections, {
  type TInspectionsColumns,
} from "@/components/tables/TableInspections.vue";
import AutocompleteDreiverAndVehicle from "@/components/autocomplete/AutocompleteDreiverAndVehicle.vue";
import UiMobileMenuButton from "@/components/ui/UiMobileMenuButton.vue";
import { useUserAbility } from "@/composables/useUser";
import { useHelpers } from "@/composables/useHelpers";
import type { TInspectionType } from "@/composables/useInspectionProfiles";
import { ESortDirection } from "@/types/drivers";
import type { Sort } from "element-plus";
import { formatDateToServer } from "@/helpers/format.helpers";
import { Download } from "@element-plus/icons-vue";

const isMounted = useMounted();
const { mdAndLarger } = useAppBreakpoints();
const { can } = useUserAbility();

const { setInspectionsCreateHash, setInspectionsDetailsHash } = useAppStore();
const { dateKeydownMask } = useHelpers();
const { fetchInspections, inspectionTypeOptions, downloadInspections } =
  useInspectionsStore();
const {
  fetchInspectionsLoading,
  createInspectionResponse,
  inspections,
  inspectionsTotalItems,
  inspectionForm,
  selectedDriver,
  selectedVehicle,
} = storeToRefs(useInspectionsStore());

const { fetchDraftsList } = useDraftsStore();
const {
  selectedDraftInspection,
  newDraft,
  updateDraftResponse,
  inspectionsDraftList,
  draftsListLoading,
  draftTotalItems,
} = storeToRefs(useDraftsStore());
const search = ref("");
const draftVisible = ref(false);
const daterange = ref([]);

const sortableColumns: TInspectionsColumns[] = [
  /* 'inspection.event_date', 'driver.fullname', 'mechanic_full_name' */
];

const initialFilters: IInspectionsFetchParams = {
  limit: 20,
  page: 1,
  vehicle_id: undefined,
  driver_id: undefined,
  start_date: undefined,
  inspection_types: [],
  signing_statuses: [],
  end_date: undefined,
  order_by: "created_at",
  direction: "desc",
};
let draftListParams = reactive<IDraftListParams>({
  limit: 20,
  page: 1,
  draft_type: "vehicle_inspection",
});

const fetchInspectionsParams = ref<IInspectionsFetchParams>({
  ...initialFilters,
});

interface ISigningStatusOption {
  label: string;
  key: InspectionSignatureStatusType;
}
const statusesOptions: ISigningStatusOption[] = [
  {
    label: "-",
    key: InspectionSignatureStatusType.NotRequired,
  },
  {
    label: "Ожидание",
    key: InspectionSignatureStatusType.Required,
  },
  {
    label: "Подписан",
    key: InspectionSignatureStatusType.Signed,
  },
  {
    label: "Отказ",
    key: InspectionSignatureStatusType.Rejected,
  },
];

watch(daterange, (v) => {
  if (v?.length) {
    fetchInspectionsParams.value.start_date = formatDateToServer(v[0]);
    fetchInspectionsParams.value.end_date = formatDateToServer(v[1]);
  } else {
    fetchInspectionsParams.value.start_date = undefined;
    fetchInspectionsParams.value.end_date = undefined;
  }
});

watch(
  [createInspectionResponse, fetchInspectionsParams],
  ([createV, paramsV]) => {
    if (createV || paramsV) {
      fetchInspections(fetchInspectionsParams.value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  [newDraft, updateDraftResponse, draftListParams],
  ([newDraftValue, updateDraftResponseValue, paramsValue]) => {
    if (newDraftValue || updateDraftResponseValue || paramsValue) {
      fetchDraftsList(draftListParams);
    }
  },
);

watch(search, (v) => {
  if (!v) {
    fetchInspectionsParams.value.vehicle_id = undefined;
    fetchInspectionsParams.value.driver_id = undefined;
  }
});

const onSortChange = (v: Sort) => {
  fetchInspectionsParams.value = {
    ...fetchInspectionsParams.value,
    order_by: v.prop,
    direction:
      v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
  };
};

function resetFilters() {
  fetchInspectionsParams.value = { ...initialFilters };
  search.value = "";
  daterange.value = [];
}

const handleSelect = (v: any) => {
  if (v?.driver_id) {
    fetchInspectionsParams.value.driver_id = v.driver_id;
    fetchInspectionsParams.value.vehicle_id = undefined;
  }
  if (v?.vehicle_id) {
    fetchInspectionsParams.value.vehicle_id = v.vehicle_id;
    fetchInspectionsParams.value.driver_id = undefined;
  }
};

const onRowClick = (rowItem: IInspections) => {
  inspectionForm.value = rowItem;
  setInspectionsDetailsHash(rowItem.id!);
};

const onDraftRowClick = (row: any) => {
  selectedDraftInspection.value = { ...row };
  inspectionForm.value = { ...row };
  if (row?.vehicle) {
    selectedVehicle.value = row?.vehicle;
  }
  if (row?.driver) {
    selectedDriver.value = row?.driver;
  }
  setInspectionsCreateHash();
};

const downloadInspectionsHandler = async () => {
  downloadInspections(fetchInspectionsParams.value);
};

onMounted(async () => {
  fetchDraftsList(draftListParams);
});
</script>

<template>
  <div>
    <Teleport v-if="isMounted" to="#header">
      <!-- desctop -->
      <template v-if="mdAndLarger">
        <div class="flex justify-between items-center w-full">
          <div class="text-nowrap text-xl">
            {{ $t("views.inspections.title") }}
          </div>

          <div>
            <el-button
              v-if="can('create', 'Inspection')"
              type="primary"
              @click="setInspectionsCreateHash"
            >
              {{ $t("views.inspections.buttonAddInspection") }}
            </el-button>
            <el-button type="default" @click="downloadInspectionsHandler">
              <el-icon><Download /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
      <!-- mobile -->
      <template v-else>
        <div class="w-full flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UiMobileMenuButton />
              <div class="text-nowrap text-lg">
                {{ $t("views.inspections.title") }}
              </div>
              <el-icon @click="() => fetchInspections(fetchInspectionsParams)"
                ><RefreshRight
              /></el-icon>
            </div>
            <el-button
              v-if="can('create', 'Inspection')"
              type="primary"
              size="small"
              @click="setInspectionsCreateHash"
            >
              {{ $t("views.inspections.buttonAddInspection") }}
            </el-button>
          </div>
          <div class="flex items-center gap-6">
            <AutocompleteDreiverAndVehicle
              v-model="search"
              clearable
              :trigger-on-focus="false"
              placeholder="Поиск по гос. номеру, марке и водителю"
              @handle-select="handleSelect"
            />
            <el-link
              class="min-w-fit"
              :underline="false"
              @click="resetFilters"
              >{{ $t("views.inspections.buttonClearSearch") }}</el-link
            >
          </div>
        </div>
      </template>
    </Teleport>

    <div class="flex items-center justify-between">
      <el-form
        class="flex gap-x-3"
        :class="{ 'flex-wrap': !mdAndLarger }"
        label-position="top"
      >
        <el-form-item label="Поиск" v-if="mdAndLarger">
          <AutocompleteDreiverAndVehicle
            v-model="search"
            clearable
            class="w-[153px]"
            :trigger-on-focus="false"
            placeholder="Поиск"
            @handle-select="handleSelect"
          />
        </el-form-item>

        <el-form-item label="Тип осмотра">
          <el-select
            v-model="fetchInspectionsParams.inspection_types"
            style="width: 151px"
            :class="{ 'flex-grow': !mdAndLarger }"
            placeholder="Не выбран"
            clearable
            multiple
            collapse-tags
          >
            <el-option
              v-for="item in inspectionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Статус подписания">
          <el-select
            v-model="fetchInspectionsParams.signing_statuses"
            style="width: 151px"
            placeholder="Не выбран"
            clearable
            multiple
            collapse-tags
          >
            <el-option
              v-for="item in statusesOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Дата">
          <el-date-picker
            v-model="daterange"
            type="daterange"
            start-placeholder="Начало"
            end-placeholder="Конец"
            value-format="YYYY-MM-DD"
            format="DD.MM.YYYY"
            class="max-w-[310px]"
            @keydown="dateKeydownMask"
            @clear="
              () => {
                daterange = [];
                fetchInspectionsParams.start_date = undefined;
                fetchInspectionsParams.end_date = undefined;
              }
            "
          >
            <template #range-separator>до</template>
          </el-date-picker>
        </el-form-item>

        <!-- <el-form-item :label="` `">
          <el-select style="width: 147px">
            <el-option v-for="item in []" :label="item" :value="item" />
          </el-select>
        </el-form-item> -->
      </el-form>

      <el-link v-if="mdAndLarger" :underline="false" @click="resetFilters">{{
        $t("views.inspections.buttonClearSearch")
      }}</el-link>
    </div>

    <div
      class="h-[calc(100vh-150px)] md:h-[calc(100vh-150px)] flex flex-col gap-2.5"
    >
      <el-switch class="w-fit" v-model="draftVisible" active-text="Черновики" />

      <TableInspections
        v-if="!draftVisible"
        v-model:pagination="fetchInspectionsParams"
        v-loading="fetchInspectionsLoading"
        class="h-[calc(100vh-178px)] flex-1 flex flex-col pb-5"
        :display-columns="[
          'inspection.event_date',
          'vehicle.car_brand',
          'vehicle.plate_number',
          'vehicle.car_model',
          'vehicle.fuel_left',
          'vehicle.current_mileage',
          'inspection.inspection_type',
          'driver.fullname',
          'inspection.signature',
          'mechanic_full_name',
        ]"
        :items="inspections || []"
        :totalItems="inspectionsTotalItems"
        :empty-text="'Никто еще не проводил осмотр'"
        :rowClassName="'cursor-pointer'"
        :loading="fetchInspectionsLoading"
        :sortable-columns="sortableColumns"
        border
        :size="mdAndLarger ? 'default' : 'small'"
        with-pagination
        @row-click="onRowClick"
        @sort-change="onSortChange"
      />

      <TableInspections
        v-else
        v-model:pagination="draftListParams"
        v-loading="draftsListLoading"
        class="flex-1 flex flex-col pb-5"
        :display-columns="[
          'inspection.event_date',
          'vehicle.car_brand',
          'vehicle.plate_number',
          'vehicle.car_model',
          'vehicle.fuel_left',
          'vehicle.current_mileage',
          'inspection.inspection_type',
          'driver.fullname',
          'inspection.signature',
          'mechanic_full_name',
        ]"
        :items="inspectionsDraftList"
        :totalItems="draftTotalItems"
        :empty-text="'Нет черновиков'"
        :rowClassName="'cursor-pointer'"
        :loading="draftsListLoading"
        :sortable-columns="sortableColumns"
        border
        :size="mdAndLarger ? 'default' : 'small'"
        with-pagination
        @row-click="onDraftRowClick"
        @sort-change="onSortChange"
      />
    </div>
  </div>
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

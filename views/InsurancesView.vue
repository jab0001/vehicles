<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

import { useInsurancesStore } from "@/stores/insurancesStore";

import VehiclesAddInsuranceModal from "@/components/vehicles/VehiclesAddInsuranceModal.vue";

import TableInsurances from "@/components/tables/TableInsurances.vue";
import TableVehiclesInsurance from "@/components/tables/TableVehiclesInsurance.vue";
import { useUserAbility } from "@/composables/useUser";
import { useAppBreakpoints } from "@/composables/useApp";
import UiMobileMenuButton from "@/components/ui/UiMobileMenuButton.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import { ElNotification, type Sort } from "element-plus";
import { ESortDirection } from "@/types/drivers";
import type { IInsurance } from "@/types/insurances";
import type {
  IFetchVehiclesParams,
  IVehicleInsuranceForm,
} from "@/types/vehicles";
import { useVehiclesInsurance } from "@/composables/useVehicles";
import { formatDateToServer } from "@/helpers/format.helpers";
import { useVehiclesStore } from "@/stores/vehicles";
import { useAppStore } from "@/stores/appStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { Setting } from "@element-plus/icons-vue";
import DashboardInsuranceSettingsModal from "@/components/dashboard/DashboardInsuranceSettingsModal.vue";

const isMounted = useMounted();
const {
  fetchInsurancesList,
  initialInsurancesParams,
  fetchInsuranceStatistics,
} = useInsurancesStore();
const { setVehiclesDetailsHash } = useAppStore();
const {
  insurancesList,
  insurancesListTotalItems,
  insurancesListLoading,
  insuranceStatisticsLoading,
  insuranceStatisticsResponse,
  insuranceDashboardSettings,
} = storeToRefs(useInsurancesStore());
const { can } = useUserAbility();
const { mdAndLarger } = useAppBreakpoints();
const {
  addInsuranceRequest,
  updateInsuranceRequest,
  updateInsurance,
  newInsurance,
  addInsuranceError,
  updateInsuranceError,
} = useVehiclesInsurance();
const { detailResult: vehicleDetails } = storeToRefs(useVehiclesStore());
const { currentCompaniesIdsList } = storeToRefs(useCompaniesManagementStore());
const { fetchVehicles } = useVehiclesStore();
const { vehicles, isFetchVehiclesLoading, vehicleTotalItems } =
  storeToRefs(useVehiclesStore());

type TTab = "current" | "without";

const DEFAULT_VEHICLE_PARAMS: IFetchVehiclesParams = {
  company_ids: currentCompaniesIdsList.value,
  limit: 20,
  page: 1,
  order_by: "created_at",
  direction: "desc",
  query: "",
  company_units: [],
  disposal: false,
  without_insurance: ["osago", "kasko", "osgop"],
};

const pageFilters = ref({ ...initialInsurancesParams });
const modalAddInsuranceVisible = ref(false);
const isEdit = ref(false);
const selectedInsuranceId = ref<undefined | number>();
const selectedDayFilter = ref<number | "custom">(0);
const customDays = ref<number | undefined>(undefined);
const activeTab = ref<TTab>("current");
const vehicleParams = ref<IFetchVehiclesParams>({ ...DEFAULT_VEHICLE_PARAMS });
const modalVisible = ref(false);

watch(
  [pageFilters, updateInsurance, newInsurance, vehicleDetails],
  ([filtersV]) => {
    if (filtersV) {
      fetchInsurancesList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  insuranceDashboardSettings.value,
  (newVal) => {
    fetchInsuranceStatistics(insuranceDashboardSettings.value);
  },
  { deep: true, immediate: true },
);

watch(selectedDayFilter, (v) => {
  if (v === "custom") {
    pageFilters.value.expires_after_days_delta = null;
  } else {
    pageFilters.value.expires_after_days_delta = v;
  }
});

watch(customDays, (v) => {
  if (v) {
    pageFilters.value.expires_after_days_delta = v;
  }
});

watch(
  [vehicleParams],
  ([paramsV]) => {
    if (paramsV) {
      fetchVehicles(vehicleParams.value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const isDisabled = (key: string) => {
  const list = vehicleParams.value.without_insurance;

  return list?.length === 1 && list?.includes(key);
};

const onSortChange = (v: Sort) => {
  if (!v.order || !v.prop) {
    const next = { ...pageFilters.value, page: 1 };
    delete (next as any).order_by;
    delete (next as any).direction;
    pageFilters.value = next;
    return;
  }

  pageFilters.value = {
    ...pageFilters.value,
    order_by: String(v.prop),
    direction:
      v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
    page: 1,
  };
};

const columns = [
  { label: "Гос. Номер", key: "plate_number", minWidth: 240, visible: true },
  { label: "Марка", key: "brand", minWidth: 108, visible: true },
  { label: "Модель", key: "car_model", minWidth: 108, visible: true },
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
];

const insuranceTypes = [
  { key: "osgop", label: "ОСГОП" },
  { key: "osago", label: "ОСАГО" },
  { key: "kasko", label: "КАСКО" },
];

const insuranceStatuses = [
  { key: "active", label: "Активный" },
  { key: "expires", label: "Истекает" },
  { key: "expired", label: "Истёк" },
];

const insuranceDayFilters = [
  { key: 0, label: "Все" },
  { key: 1, label: "1 день" },
  { key: 7, label: "7 дней" },
  { key: 30, label: "30 дней" },
  { key: "custom", label: "Свой период" },
];

const onRowClick = async (rowItem: IInsurance | any) => {
  setVehiclesDetailsHash(rowItem.vehicle_id, "insurance");
};

const clearFilters = () => {
  pageFilters.value = {
    ...initialInsurancesParams,
  };
  selectedDayFilter.value = 0;
  customDays.value = undefined;
};

const clearVehicleFilters = () => {
  vehicleParams.value = { ...DEFAULT_VEHICLE_PARAMS };
};

const closeAndClearModal = () => {
  modalAddInsuranceVisible.value = false;
  isEdit.value = false;
};

const handeAddInsurance = async (form: IVehicleInsuranceForm) => {
  if (!isEdit.value) {
    try {
      await addInsuranceRequest({
        ...form,
        expires_at: formatDateToServer(form.expires_at),
        issued_date: formatDateToServer(form.issued_date),
        company_id: form.vehicle.company.id!,
        vehicle_id: form.vehicle.id!,
      });
      ElNotification({
        // title: "Успешный запрос",
        message: "Cтраховка добавленa",
        type: "success",
      });
      modalAddInsuranceVisible.value = false;
    } catch (error) {
      ElNotification({
        // title: releaseToLineError.value?.title,
        message: addInsuranceError.value?.message,
        type: "error",
      });
    }
  } else {
    try {
      await updateInsuranceRequest({
        ...form,
        expires_at: formatDateToServer(form.expires_at),
        issued_date: formatDateToServer(form.issued_date),
        company_id: form.vehicle.company.id!,
        vehicle_id: form.vehicle.id!,
        history_id: selectedInsuranceId.value!,
      });
      ElNotification({
        // title: "Успешный запрос",
        message: "Cтраховка обновлена",
        type: "success",
      });
      modalAddInsuranceVisible.value = false;
    } catch (error) {
      ElNotification({
        // title: releaseToLineError.value?.title,
        message: updateInsuranceError.value?.message,
        type: "error",
      });
    }
  }
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="flex items-center gap-4">
        <UiMobileMenuButton v-if="!mdAndLarger" />
        <div class="text-md text-nowrap text-xl">
          {{ "Страхование" }}
        </div>
      </div>

      <el-button
        v-if="can('create', 'Damage')"
        type="primary"
        @click="modalAddInsuranceVisible = true"
        >{{ "Добавить полис" }}</el-button
      >
    </div>
  </Teleport>

  <div class="grid grid-cols-3 gap-4" v-loading="insuranceStatisticsLoading">
    <el-card>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center font-semibold"
        >
          {{ insuranceStatisticsResponse?.active || 0 }}
        </div>

        <div class="leading-tight">
          <p class="text-sm font-medium">Действующие</p>
        </div>
      </div>
    </el-card>
    <el-card>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center font-semibold"
        >
          {{ insuranceStatisticsResponse?.expires_soon || 0 }}
        </div>

        <div class="leading-tight">
          <p class="text-sm font-medium">Скоро истекают</p>
        </div>
      </div>
    </el-card>
    <el-card>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center font-semibold"
        >
          {{ insuranceStatisticsResponse?.wo_insurance || 0 }}
        </div>

        <div class="leading-tight">
          <p class="text-sm font-medium">Автомобили без страховки</p>
        </div>
        <el-link
          :icon="Setting"
          :underline="false"
          style="font-size: 16px; margin-left: auto"
          @click="modalVisible = true"
        />
      </div>
    </el-card>
  </div>

  <div class="text-md text-nowrap text-lg mt-2">
    <el-form-item label="">
      <el-radio-group v-model="activeTab">
        <el-radio-button label="current" class="custom-btn">
          Все страховые полисы
        </el-radio-button>
        <el-radio-button label="without" class="custom-btn">
          Автомобили без полисов
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
  </div>

  <div class="flex justify-between items-center w-full gap-3">
    <div class="flex items-end gap-3 w-full" v-if="activeTab === 'current'">
      <div class="flex flex-col gap-2">
        <p class="text-sm">Поиск</p>
        <UiSearch
          v-model="pageFilters.query"
          class="flex-grow max-w-[200px]"
          :placeholder="'Поиск'"
        />
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Тип страховки</p>
        <el-select
          v-model="pageFilters.insurance_types"
          class="w-40"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in insuranceTypes"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Статус</p>
        <el-select
          v-model="pageFilters.insurance_statuses"
          class="w-40"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in insuranceStatuses"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Дата окончания</p>
        <el-select
          v-model="selectedDayFilter"
          class="w-40"
          placeholder="Не выбран"
          clearable
        >
          <el-option
            v-for="item in insuranceDayFilters"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>

        <el-input-number
          v-if="selectedDayFilter === 'custom'"
          v-model="customDays"
          :min="1"
          :max="365"
          class="mt-1"
          placeholder="Дней"
        />
      </div>

      <el-link class="ml-auto" :underline="false" @click="clearFilters"
        >Сбросить всё</el-link
      >
    </div>
    <div class="flex items-end gap-3 w-full" v-if="activeTab === 'without'">
      <div class="flex flex-col gap-2">
        <p class="text-sm">Поиск</p>
        <UiSearch
          v-model="vehicleParams.query"
          class="w-64"
          placeholder="Поиск по а/м"
        />
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Без полиса</p>
        <el-select
          v-model="vehicleParams.without_insurance"
          class="w-40"
          placeholder="Не выбран"
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in insuranceTypes"
            :key="item.key"
            :label="item.label"
            :value="item.key"
            :disabled="isDisabled(item.key)"
          />
        </el-select>
      </div>
      <el-link class="ml-auto" :underline="false" @click="clearVehicleFilters"
        >Сбросить всё</el-link
      >
    </div>
  </div>

  <TableInsurances
    v-if="activeTab === 'current'"
    v-model:pagination="pageFilters"
    v-loading="insurancesListLoading"
    class="h-[calc(100vh-300px)] md:h-[calc(100vh-300px)] flex flex-col pb-5 pt-5"
    :display-columns="[
      'insurance_number',
      'plate_number',
      'vehicle_name',
      'insurance_type',
      'company_name',
      'expires_at',
      'status',
      'documents',
    ]"
    :sortable-columns="['expires_at']"
    :items="insurancesList"
    :totalItems="insurancesListTotalItems"
    :empty-text="'Страховки не найдены'"
    :rowClassName="'cursor-pointer'"
    :loading="insurancesListLoading"
    :size="mdAndLarger ? 'default' : 'small'"
    border
    with-pagination
    @row-click="onRowClick"
    @sort-change="onSortChange"
  />

  <TableVehiclesInsurance
    v-if="activeTab === 'without'"
    v-model:pagination="vehicleParams"
    v-loading="isFetchVehiclesLoading"
    class="h-[calc(100vh-300px)] flex flex-col flex-1 pb-5 pt-5"
    :items="vehicles"
    :columns="columns"
    :totalItems="vehicleTotalItems"
    :empty-text="'Автомобили не добавлены'"
    :rowClassName="'cursor-pointer'"
    :loading="isFetchVehiclesLoading"
    border
    with-pagination
    @row-click="onRowClick"
  />

  <VehiclesAddInsuranceModal
    v-if="modalAddInsuranceVisible"
    :modalVisible="modalAddInsuranceVisible"
    @close="closeAndClearModal"
    :isEdit="isEdit"
    :withVehicleSelect="true"
    @success="handeAddInsurance"
  />

  <DashboardInsuranceSettingsModal
    :modal-visible="modalVisible"
    :isDashboard="false"
    @close-modal="modalVisible = false"
  />
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import dayjs from "dayjs";

import { useDowntimeStore } from "@/stores/downtimeStore";

import TableDowntime from "@/components/tables/TableDowntime.vue";
import TableDowntimeStatuses from "@/components/tables/TableDowntimeStatuses.vue";
import UiSearch from "@/components/ui/UiSearch.vue";

import * as t from "@/types/downtime";
import { useVehicleDowntime } from "@/composables/useVehicles";
import ModalVehicleDowntimeCreate from "@/components/modals/ModalVehicleDowntimeCreate.vue";
import { useVehicleDowntimeStore } from "@/stores/vehicles";
import type { IVehicleDowntimeReasonCreateForm } from "@/types/vehicles";
import { getVehicleFullname } from "@/helpers/fullname.helpers";
import { formatDayTime } from "@/helpers/format.helpers";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);
const pageFilters = ref<t.IDowntimeFetchParams>({
  limit: 20,
  page: 1,
  statuses: [],
  company_ids: currentCompaniesIdsList.value,
  search: "",
});
const updateTime = ref(dayjs().format("HH:mm"));
const isMounted = useMounted();
const {
  downtimeTableItems,
  downtimeTotalItems,
  fetchDowntimeLoading,
  downtimeLastRefreshTime,
} = storeToRefs(useDowntimeStore());
const {
  fetchDowntime,
  fetchDowntimeLastRefreshTime,
  refreshDowntime,
  fetchDowntimeStatuses,
} = useDowntimeStore();
const { fetchVehicleDowntimeReasons, createVehicleDowntimeReasons } =
  useVehicleDowntimeStore();
const { downtimeReasons } = storeToRefs(useVehicleDowntimeStore());

const { parkingPlaces, fetchParkingPlaces } = useVehicleDowntime();
const modalVisible = ref(false);
const currentDowntime = ref<t.IDowntimeTableItems>();
const currentDowntimeCreateForm = computed<IVehicleDowntimeReasonCreateForm>(
  () => ({
    downtime_reason_id:
      downtimeReasons.value?.find(
        (item) => item.name == currentDowntime.value?.status
      )?.id ?? 0,
    description: currentDowntime.value?.description ?? "",
    parking_place_id:
      parkingPlaces.value?.find(
        (place) => place.name === currentDowntime.value?.parking_place
      )?.id ?? 0,
  })
);
const isLoading = ref(false);

onMounted(() => {
  fetchVehicleDowntimeReasons();
  fetchDowntimeLastRefreshTime();
  fetchDowntime(pageFilters.value);
  fetchParkingPlaces();
});

watch(
  pageFilters,
  (value) => {
    if (value) {
      fetchDowntime(pageFilters.value);
    }
  },
  {
    deep: true,
  }
);

const updateData = async () => {
  isLoading.value = true;
  try {
    await refreshDowntime();
    await fetchDowntimeStatuses({ company_ids: currentCompaniesIdsList.value });
    await fetchDowntimeLastRefreshTime();
    await fetchDowntime(pageFilters.value);
  } catch (error) {
    console.error(error);
  }
  isLoading.value = false;
};

const onStatusChange = (statuses: string[]) => {
  pageFilters.value.statuses = statuses;
};

const clearFilters = () => {
  pageFilters.value = {
    limit: 20,
    page: 1,
    statuses: pageFilters.value.statuses,
    company_ids: [],
    search: "",
  };
  fetchDowntime(pageFilters.value);
};

const onRowClick = (v: t.IDowntimeTableItems) => {
  console.log({ v });
  currentDowntime.value = v;
  modalVisible.value = true;
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Детализация по а/м" }}
      </div>

      <div class="flex items-center gap-3">
        <UiSearch
          v-model="pageFilters.search"
          class="w-64"
          placeholder="Поиск по а/м и владельцу"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 text-xs text-[#A8ABB2]">
          <img src="@/assets/images/reload-icon.svg" alt="" />{{
            downtimeLastRefreshTime
              ? formatDayTime(downtimeLastRefreshTime, true)
              : ""
          }}
        </div>
        <el-button type="primary" :loading="isLoading" @click="updateData">
          {{ "Обновить" }}
        </el-button>
      </div>
    </div>
  </Teleport>
  <Teleport v-if="isMounted" to="#sidebar">
    <div class="px-6 py-5 bg-[#FAFAFA] h-[calc(100vh-96px)] overflow-y-auto border-r border-[#EBEEF5] mt-[96px]">
      <div class="color-black text-lg mb-5">А/м в простое</div>
      <TableDowntimeStatuses
        class="pr-6"
        withSelection
        @status-change="onStatusChange"
      />
    </div>
  </Teleport>
  <div class="flex w-full">
    <TableDowntime
      v-model:pagination="pageFilters"
      v-loading="isLoading"
      class="h-[calc(100vh-60px)] flex flex-col pb-5 flex-1 overflow-x-scroll"
      :items="downtimeTableItems"
      :display-columns="[]"
      :sortable-columns="[]"
      :totalItems="downtimeTotalItems"
      :empty-text="'Автомобили не найдены'"
      :rowClassName="'cursor-pointer'"
      :loading="fetchDowntimeLoading"
      border
      with-pagination
      @row-click="onRowClick"
    />

    <ModalVehicleDowntimeCreate
      v-if="modalVisible && currentDowntime && currentDowntimeCreateForm"
      :modal-visible="modalVisible"
      :downtime="currentDowntimeCreateForm"
      :vehiclePlateNumber="currentDowntime.plate_number"
      :vehicle-id="currentDowntime.vehicle_id"
      :vehicle-fullname="
        getVehicleFullname(
          currentDowntime.brand,
          currentDowntime.car_model,
          currentDowntime.plate_number
        )
      "
      @close-modal="modalVisible = false"
      @refresh="
        () => {
          modalVisible = false;
          updateData();
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { ref, watch, computed } from "vue";
import { useMounted } from "@vueuse/core";

import { useVehiclesOnLineStore } from "@/stores/vehiclesOnLineStore";
import { useAppBreakpoints } from "@/composables/useApp";

import {
  type IVehiclesOnLineItem,
  type IVehiclesOnLineParams,
  EReleasesOnLineColumns,
} from "@/types/vehiclesOnLine";
import type { Sort } from "element-plus";

import VehiclesOnLineFormModal from "@/components/vehiclesOnLine/VehiclesOnLineFormModal.vue";
import AutocompleteDreiverAndVehicle from "@/components/autocomplete/AutocompleteDreiverAndVehicle.vue";
import TableReleasesOnLine from "@/components/tables/TableReleasesOnLine.vue";
import UiMobileMenuButton from "@/components/ui/UiMobileMenuButton.vue";

const isMounted = useMounted();
const { initialFilters, fetchVehiclesOnLine } = useVehiclesOnLineStore();
const { vehiclesOnLine, vehiclesOnLineTotalItems, fetchLoading } = storeToRefs(
  useVehiclesOnLineStore()
);
const { mdAndLarger } = useAppBreakpoints();

const vehicleOnLineModalVisible = ref(false);
const search = ref("");
const selectedRelease = ref<IVehiclesOnLineItem | undefined>();
const vehiclesOnLineChanges = ref(false);
const vehiclesOnLineParams = ref<IVehiclesOnLineParams>({
  ...initialFilters,
});

const tableSort = computed<Sort>(() => ({
  prop: initialFilters.order_by ?? "event_date",
  order: initialFilters.direction === "asc" ? "ascending" : "descending",
}));

watch(
  [vehiclesOnLineParams, vehiclesOnLineChanges],
  ([paramsV, vehiclesOnLineChangesV]) => {
    if (paramsV || vehiclesOnLineChangesV) {
      fetchVehiclesOnLine(vehiclesOnLineParams.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(search, (v) => {
  if (!v) {
    vehiclesOnLineParams.value.vehicle_id = undefined;
    vehiclesOnLineParams.value.driver_id = undefined;
  }
});

function resetFilters() {
  vehiclesOnLineParams.value = { ...initialFilters, on_line_currently: false };
  search.value = "";
}
const onRowClick = (rowItem: IVehiclesOnLineItem) => {
  selectedRelease.value = { ...rowItem };
  openReleaseToLineModal();
};
const openReleaseToLineModal = () => {
  vehicleOnLineModalVisible.value = true;
};
const closeReleaseToLineModal = () => {
  selectedRelease.value = undefined;
  vehicleOnLineModalVisible.value = false;
  vehiclesOnLineChanges.value = false;
};
const handleRefresh = async () => {
  vehiclesOnLineChanges.value = true;
  closeReleaseToLineModal();
};
const handleSelect = (v: any) => {
  if (v?.driver_id) {
    vehiclesOnLineParams.value.driver_id = v.driver_id;
    vehiclesOnLineParams.value.vehicle_id = undefined;
  }
  if (v?.vehicle_id) {
    vehiclesOnLineParams.value.vehicle_id = v.vehicle_id;
    vehiclesOnLineParams.value.driver_id = undefined;
  }
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <template v-if="mdAndLarger">
      <div class="flex justify-between items-center w-full">
        <div class="text-md text-nowrap text-xl">
          {{ $t("views.lines.title") }}
        </div>

        <div class="flex items-center gap-6">
          <AutocompleteDreiverAndVehicle
            v-model="search"
            clearable
            class="w-[325px]"
            :trigger-on-focus="false"
            placeholder="Поиск по гос. номеру, марке и водителю"
            @handle-select="handleSelect"
          />
          <el-checkbox
            v-model="vehiclesOnLineParams.on_line_currently"
            label="Сейчас на линии"
          />
          <el-link :underline="false" @click="resetFilters"
            >Сбросить всё</el-link
          >
        </div>

        <el-button type="primary" @click="openReleaseToLineModal">{{
          $t("views.lines.setOnline")
        }}</el-button>
      </div>
    </template>
    <template v-else>
      <div class="w-full flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UiMobileMenuButton />
            <div class="text-nowrap text-lg">
              {{ $t("views.lines.title") }}
            </div>
          </div>
          <el-button type="primary" @click="openReleaseToLineModal">{{
            $t("views.lines.setOnline")
          }}</el-button>
        </div>
        <div class="flex items-center gap-2">
          <AutocompleteDreiverAndVehicle
            v-model="search"
            clearable
            class="w-full"
            :trigger-on-focus="false"
            placeholder="Поиск по гос. номеру, марке и водителю"
            @handle-select="handleSelect"
          />
          <div class="flex flex-col items-end">
            <el-checkbox
              v-model="vehiclesOnLineParams.on_line_currently"
              label="Сейчас на линии"
              size="small"
            />
            <el-link :underline="false" @click="resetFilters"
              >Сбросить всё</el-link
            >
          </div>
        </div>
      </div>
    </template>
  </Teleport>

  <div>
    <TableReleasesOnLine
      class="h-[calc(100vh-108px)] md:h-[calc(100vh-60px)] flex flex-col flex-1 pb-5"
      v-model:pagination="vehiclesOnLineParams"
      v-loading="fetchLoading"
      :display-columns="[
        'event_date',
        'vehicle.plate_number',
        'vehicle.brand',
        'vehicle.car_model',
        'driver.fullname',
      ]"
      :sortable-columns="['event_date', 'driver.fullname']"
      :items="vehiclesOnLine"
      :totalItems="vehiclesOnLineTotalItems"
      :empty-text="'Нет автомобилей на линии'"
      :rowClassName="'cursor-pointer'"
      :loading="fetchLoading"
      :table-sort="tableSort"
      border
      with-pagination
      @row-click="onRowClick"
    />

    <VehiclesOnLineFormModal
      v-if="vehicleOnLineModalVisible"
      :modal-visible="vehicleOnLineModalVisible"
      :release="selectedRelease"
      @close-modal="closeReleaseToLineModal"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";

import WorkingShiftsAddVehicleModal from "@/components/workingShifts/WorkingShiftsAddVehicleModal.vue";
import WorkingShiftsAddDriverModal from "@/components/workingShifts/WorkingShiftsAddDriverModal.vue";
import WorkingShiftsRecorModal from "@/components/workingShifts/WorkingShiftsRecorModal.vue";
import WorkingShiftsDeleteModal from "@/components/workingShifts/WorkingShiftsDeleteModal.vue";
import TableWorkingShifts from "@/components/tables/TableWorkingShifts.vue";
import { useWorkingShiftsStore } from "@/stores/workingShiftStore";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";

const { setWorkingShiftsDriverCreateHash } = useAppStore();

const { fetchWorkingShiftsList, prevFetchWorkingShiftsList, shiftStatus } =
  useWorkingShiftsStore();

const {
  workingShiftsData,
  workingShiftsListLoading,
  workingShiftsParams,
  onlyActiveVehicles,
  prevMonth,
} = storeToRefs(useWorkingShiftsStore());

const isMounted = useMounted();
const addVehicleAutomaticModalVisible = ref(false);
const deleteModalVisible = ref(false);
const addDriverModalVisible = ref(false);
const openRecordModalVisible = ref(false);
const shouldUpdateRecord = ref(false);
const vehicleId = ref();
const driverId = ref();
const deleteModalForVehicle = ref(true);

watch(
  workingShiftsParams,
  async (v) => {
    if (v) {
      await prevFetchWorkingShiftsList({
        month: prevMonth.value,
      });

      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const createWorkingShift = () => {
  setWorkingShiftsDriverCreateHash();
};

const addVehicle = () => {
  addVehicleAutomaticModalVisible.value = true;
};

const closeAddVehicleModal = () => {
  addVehicleAutomaticModalVisible.value = false;
};

const addDriver = (id: number) => {
  addDriverModalVisible.value = true;
  vehicleId.value = id;
};

const closeAddDriverModal = () => {
  addDriverModalVisible.value = false;
};

const openRecordModal = () => {
  openRecordModalVisible.value = true;
};

const closeRecordModal = () => {
  openRecordModalVisible.value = false;
};

const deleteModalOpen = (payload: {
  forVehicle: boolean;
  vehicle_id: number;
  driver_id?: number;
}) => {
  if (payload.driver_id) {
    driverId.value = payload.driver_id;
  }

  deleteModalForVehicle.value = payload.forVehicle;
  deleteModalVisible.value = true;
  vehicleId.value = payload.vehicle_id;
};

const closeDeleteModal = () => {
  deleteModalVisible.value = false;
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "График работы штатных сотрудников" }}
      </div>

      <div>
        <el-button type="primary" @click="addVehicle">{{
          "Добавить а/м"
        }}</el-button>
        <el-button type="primary" @click="createWorkingShift">{{
          "Распределить смены"
        }}</el-button>
      </div>
    </div>
  </Teleport>

  <div class="flex items-end gap-2">
    <el-form-item label="Месяц и год" label-position="top">
      <el-date-picker
        v-model="workingShiftsParams.month"
        type="month"
        format="MM.YYYY"
        value-format="YYYY-MM-01"
        placeholder="Выберите месяц"
        class="w-[153px]"
      />
    </el-form-item>

    <el-form-item label="" label-position="top">
      <el-checkbox v-model="onlyActiveVehicles">
        Только активные машины
      </el-checkbox>
    </el-form-item>

    <el-form-item label="" label-position="top" class="ml-auto">
      <div class="flex gap-6">
        <div
          v-for="(value, key) in shiftStatus"
          :key="key"
          class="flex items-center gap-1"
        >
          <span
            :class="`w-[12px] h-[12px] rounded-full`"
            :style="{ backgroundColor: value.color }"
          ></span>
          {{ value.label }}
        </div>
      </div>
    </el-form-item>
  </div>

  <div
    class="max-h-[calc(100vh-96px)] flex flex-col pb-5 max-w-[1442px] mx-auto"
  >
    <TableWorkingShifts
      :month="workingShiftsParams.month"
      :vehicles="workingShiftsData?.vehicles"
      v-loading="workingShiftsListLoading"
      @openRecordModal="openRecordModal"
      @update:shouldUpdateRecord="shouldUpdateRecord = $event"
      @addDriver="addDriver"
      @deleteModal="deleteModalOpen"
    />
  </div>

  <WorkingShiftsAddVehicleModal
    v-if="addVehicleAutomaticModalVisible"
    :modal-visible="addVehicleAutomaticModalVisible"
    @close-modal="closeAddVehicleModal"
  />

  <WorkingShiftsAddDriverModal
    v-if="addDriverModalVisible"
    :modal-visible="addDriverModalVisible"
    @close-modal="closeAddDriverModal"
    :vehicleId="vehicleId"
  />

  <WorkingShiftsDeleteModal
    v-if="deleteModalVisible"
    :modal-visible="deleteModalVisible"
    @close-modal="closeDeleteModal"
    :vehicleId="vehicleId"
    :driverId="driverId"
    :deleteModalForVehicle="deleteModalForVehicle"
  />

  <WorkingShiftsRecorModal
    v-if="openRecordModalVisible"
    :modal-visible="openRecordModalVisible"
    @close-modal="closeRecordModal"
    :isUpdate="shouldUpdateRecord"
  />
</template>

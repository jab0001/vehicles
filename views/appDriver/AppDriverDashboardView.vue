<script setup lang="ts">
import { Bell } from "@element-plus/icons-vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import {
  useAppDriverDashboard,
  useAppDriverDriver,
  useAppDriverInspections,
} from "@/composables/useAppDriver";
import { useAuth } from "@/composables/UseAuth";

import AppDriverActivityCard from "@/components/appDriver/AppDriverActivityCard.vue";
import AppDriverBalanceCard from "@/components/appDriver/AppDriverBalanceCard.vue";
import AppDriverVehicleCard from "@/components/appDriver/AppDriverVehicleCard.vue";
import AppDriverDocumentsRequired from "./AppDriverDocumentsRequired.vue";
import { useAppDriverGroupStore } from "@/stores/appDriverGroupStore";

import { storeToRefs } from "pinia";
import { dayjs } from "element-plus";

const router = useRouter();
const { removeToken } = useAuth();
const initialLoading = ref(false);
const dialogVisible = ref(false);
const {
  appDriverInfo,
  fetchAppDriverInfo,

  appDriverVehicleInfo,
  fetchAppDriverVehicleInfo,
} = useAppDriverDriver();

const {
  inspectionToSignList,
  appDriverInspectionsSignatureIsRequiredResponse,
  fetchDriverInspectionsSignatureIsRequired,
} = useAppDriverInspections();

const { fetchDriverGroupList, fetchLatestTransfer } = useAppDriverGroupStore();
const { driverGroup, latestTransfer } = storeToRefs(useAppDriverGroupStore());
const {
  daysOffTitle,
  fetchDaysOffList,
  inspectionsTitle,
  fetchAppDriverInspectionsList,
  damagesTitle,
  fetchAppDriverDamagesList,
  finesTitle,
  fetchappDriverFinesList,
} = useAppDriverDashboard();

const appDriverLogout = () => {
  removeToken();
  router.push({ name: "AppDriverAuthStart" });
};

function refresh() {
  Promise.all([
    fetchDriverInspectionsSignatureIsRequired(),
    fetchAppDriverInfo(),
    fetchAppDriverVehicleInfo(),
    fetchDriverGroupList({ is_active: true }),
    fetchDaysOffList({
      date_gte: dayjs().startOf("month").format("YYYY-MM-DD"),
      date_lt: dayjs().endOf("month").format("YYYY-MM-DD"),
    }),
    fetchAppDriverInspectionsList(),
    fetchAppDriverDamagesList(),
    fetchappDriverFinesList(),
  ])
    .then(() => {
      if (driverGroup.value) {
        fetchLatestTransfer({ group_id: driverGroup.value.id });
      }
      if (inspectionToSignList.value.length > 0) {
        dialogVisible.value = true;
      }
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      initialLoading.value = false;
    });
}

onMounted(() => {
  initialLoading.value = true;
  refresh();
});
</script>

<template>
  <div
    v-loading="initialLoading"
    class="relative flex-1 flex flex-col gap-2.5 pb-8 pt-2.5 px-4 bg-app-driver-cover bg-no-repeat"
  >
    <div
      class="absolute top-2.5 left-2.5 bg-blue-500 rounded-full p-1.5"
      @click="appDriverLogout"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-5 stroke-white"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
        />
      </svg>
    </div>

    <div
      class="absolute top-2.5 right-2.5 bg-blue-500 rounded-full p-1.5"
      @click="router.go(0)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-5 stroke-white"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </div>

    <section v-if="!initialLoading" class="flex justify-center mb-7">
      <div
        class="relative flex items-center gap-1 px-3 py-1 rounded-2xl bg-[#A8B6D11F] text-white shadow-app-driver"
        @click="router.push({ name: 'AppDriverNotifications' })"
      >
        <!-- <p
          class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--text-color-error)] border-2 border-[var(--fill-color-light)] transition-all"
        ></p> -->

        <el-icon size="16"><Bell /></el-icon>
        <span>Уведомления</span>
      </div>
    </section>

    <section v-if="!initialLoading" class="w-full flex-1 flex flex-col gap-2.5">
      <AppDriverBalanceCard
        :driver="appDriverInfo"
        :vehicle="appDriverVehicleInfo"
        @click="router.push({ name: 'AppDriverBalance' })"
        @refresh="fetchAppDriverInfo"
      />

      <AppDriverVehicleCard
        v-if="appDriverVehicleInfo?.id || driverGroup?.id"
        :vehicle="appDriverVehicleInfo"
        :driver-group="driverGroup"
        :driver="appDriverInfo!"
        :latest-transfer="latestTransfer"
        @create-transfer-success="refresh"
        @refresh="refresh"
      />

      <div class="grid grid-cols-2 gap-2">
        <AppDriverActivityCard
          :type="'fine'"
          :data="finesTitle"
          @click="router.push({ name: 'AppDriverFines' })"
        />
        <AppDriverActivityCard
          :type="'damage'"
          :data="damagesTitle"
          @click="router.push({ name: 'AppDriverDamages' })"
        />
        <AppDriverActivityCard
          :type="'inspection'"
          :data="inspectionsTitle"
          @click="router.push({ name: 'AppDriverInspections' })"
        />
        <AppDriverActivityCard
          :type="'document'"
          @click="router.push({ name: 'AppDriverDocuments' })"
        />
        <AppDriverActivityCard
          :type="'daysOff'"
          :data="daysOffTitle"
          @click="router.push({ name: 'AppDriverDaysOff' })"
        />
      </div>

      <!-- <el-button plain @click="dialogVisible = true">
        Documents Dialog
      </el-button> -->

      <!-- <el-dialog
        v-if="dialogVisible"
        v-model="dialogVisible"
        fullscreen
        :show-close="false"
      >
        <AppDriverDocumentsRequired
          @close="dialogVisible = false"
        />
      </el-dialog> -->

      <el-dialog
        v-if="inspectionToSignList.length"
        v-model="dialogVisible"
        fullscreen
        :show-close="false"
      >
        <AppDriverDocumentsRequired
          inspection-sign
          :inspectionsToSign="inspectionToSignList"
          @close="dialogVisible = false"
        />
      </el-dialog>
    </section>

    <el-link class="w-fit mx-auto" type="primary"
      >Написать в техподдержку</el-link
    >
  </div>
</template>

<style scoped>
:deep(.el-loading-mask) {
  background-color: transparent;
}
:deep(.el-dialog__body) {
  height: 100%;
}
:deep(.el-dialog__header) {
  padding-bottom: 0;
}
</style>

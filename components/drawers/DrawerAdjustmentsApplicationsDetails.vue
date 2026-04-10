<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useAppStore } from "@/stores/appStore";
import { useAdjustmentsApplicationsStore } from "@/stores/adjustmentsApplicationsStore";
import { useBalanceOperationsStore } from "@/stores/balanceOperationsStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsAdjustmentsApplication from "@/components/forms/FormsAdjustmentsApplication.vue";
import { computed } from "vue";

const route = useRoute();
const { hideDrawer } = useAppStore();
const { fetchOperationDetail } = useBalanceOperationsStore();
const {
  updateAdjustmentApplication,
  updateAdjustmentApplicationStatus,
  fetchadjustmentDetails,
  fetchAdjustmentsList,
} = useAdjustmentsApplicationsStore();
const {
  adjustmentDetailsResult,
  adjustmentDetailsLoading,
  updateAdjustmentLoading,
  adjustmentsApplicationsForm,
  selectedBalanceOperation,
  disabledForStatuses,
} = storeToRefs(useAdjustmentsApplicationsStore());

fetchadjustmentDetails({
  adjustment_id: route.hash?.split("/")[2],
}).then((r) => {
  if (r?.operation_id) {
    fetchOperationDetail({ operation_id: r.operation_id }).then((o) => {
      selectedBalanceOperation.value = { ...o };
    });
  }
});

const handleUpdate = async () => {
  try {
    if (
      adjustmentDetailsResult.value?.status !==
      adjustmentsApplicationsForm.value.status
    ) {
      await updateAdjustmentApplicationStatus();
    }

    if (
      adjustmentDetailsResult.value?.comment !==
      adjustmentsApplicationsForm.value.comment
    ) {
      await updateAdjustmentApplication();
    }
    // fetchAdjustmentsList();
  } catch (error) {
    console.error("Ошибка при обновлении заявления:", error);
  }
};
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      3аявление на корректировку {{ adjustmentDetailsResult?.id }}
    </h1>

    <FormsAdjustmentsApplication
      v-loading="adjustmentDetailsLoading || updateAdjustmentLoading"
      disabled
    >
      <template #footer>
        <div
          v-if="!disabledForStatuses"
          class="w-full flex items-center justify-end mt-4"
        >
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="handleUpdate">
            Сохранить
          </el-button>
        </div>
      </template>
    </FormsAdjustmentsApplication>
  </UiDrawerWrapper>
</template>

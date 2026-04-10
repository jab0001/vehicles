<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStatemenDriverDetail from "@/components/forms/FormStatementDriverDetail.vue";
import { useSalaryStatementsStore } from "@/stores/salaryStatementsStore";
import { useAppStore } from "@/stores/appStore";
import { computed, ref, watch } from "vue";
import type { IUpdateDriverForm } from "@/types/salaryStatements";
import SalaryStatementDetailedRideAndShiftsModalModal from "@/components/salaryStatements/SalaryStatementDetailedRideAndShiftsModalModal.vue";

const route = useRoute();
const {
  fetchDriver,
  fetchStatement,
  updateDriverRequest,
  deleteDriverRequest,
  recalculateDriverRequest,
  fetchShiftList,
} = useSalaryStatementsStore();
const {
  driverResponse,
  driverLoading,
  updateDriverLoading,
  statementResponse,
  statementLoading,
  recalculateDriverResponse,
  recalculateDriverLoading,

  detailedRideAndShiftsModal,
} = storeToRefs(useSalaryStatementsStore());

const { hideDrawer } = useAppStore();

const driverForm = ref<IUpdateDriverForm>({
  manual_fine: null,
  manual_fine_comment: null,
  manual_bonus: null,
  manual_bonus_comment: null,
});

const isDeleteDisabled = computed(() => {
  const MIN_DRIVERS_NUMBER = 2;
  return (statementResponse.value?.number_of_drivers ?? 0) < MIN_DRIVERS_NUMBER;
});

const formRef = ref<{
  getForm: () => IUpdateDriverForm;
} | null>(null);

const closeStatementDriver = () => {
  hideDrawer();
};

const deleteStatementDriver = () => {
  deleteDriverRequest({
    ss_id: Number(route.hash?.split("/")[2]),
    ss_driver_id: Number(route.hash?.split("/")[3]),
  });

  hideDrawer();
};

const updateStatementDriver = async () => {
  if (!formRef.value) return;

  const settings = formRef.value.getForm();

  updateDriverRequest({
    ss_id: Number(route.hash?.split("/")[2]),
    ss_driver_id: Number(route.hash?.split("/")[3]),
    ...settings,
  });

  hideDrawer();
};

const recalculateStatementDriver = (v: any) => {
  recalculateDriverRequest({
    ss_id: v.salary_statement_id,
    ss_driver_id: v.id,
  });
};

watch([recalculateDriverResponse], async ([vRecalculate]) => {
  if (vRecalculate) {
    fetchDriver({
      ss_id: Number(route.hash?.split("/")[2]),
      ss_driver_id: Number(route.hash?.split("/")[3]),
    });
  }
});

const closeDetailedRideAndShiftsModal = () => {
  detailedRideAndShiftsModal.value = false;
};

const openDetailed = async (v: any) => {
  detailedRideAndShiftsModal.value = true;
  await fetchShiftList({ ss_id: v.salary_statement_id, ss_driver_id: v.id });
};

fetchDriver({
  ss_id: Number(route.hash?.split("/")[2]),
  ss_driver_id: Number(route.hash?.split("/")[3]),
});
fetchStatement({
  ss_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium">
      Выплата в ведомость {{ statementResponse?.id }}
    </h1>

    <FormsStatemenDriverDetail
      v-if="statementResponse && driverResponse"
      v-loading="
        driverLoading ||
        updateDriverLoading ||
        statementLoading ||
        recalculateDriverLoading
      "
      ref="formRef"
      class="mt-4"
      :driverForm="driverForm"
      :statement="statementResponse"
      :driver="driverResponse"
      @recalculate="recalculateStatementDriver"
      @open-details="openDetailed"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button
            type="primary"
            class="mr-auto"
            :disabled="isDeleteDisabled"
            @click="deleteStatementDriver"
            >Удалить из ведомости</el-button
          >
          <el-button type="default" @click="closeStatementDriver"
            >Не Сохранять</el-button
          >
          <el-button type="primary" @click="updateStatementDriver"
            >Сохранить</el-button
          >
        </div>
      </template>
    </FormsStatemenDriverDetail>

    <SalaryStatementDetailedRideAndShiftsModalModal
      v-if="detailedRideAndShiftsModal && statementResponse"
      :modal-visible="detailedRideAndShiftsModal"
      @close-modal="closeDetailedRideAndShiftsModal"
      :statement-id="statementResponse?.id"
    />
  </UiDrawerWrapper>
</template>

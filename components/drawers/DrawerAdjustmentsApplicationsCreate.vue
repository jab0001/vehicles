<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

import { useAppStore } from "@/stores/appStore";
import { useAdjustmentsApplicationsStore } from "@/stores/adjustmentsApplicationsStore";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { useDrivers } from "@/composables/useDrivers";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsAdjustmentsApplication from "@/components/forms/FormsAdjustmentsApplication.vue";

const route = useRoute();
const { hideDrawer } = useAppStore();
const { createAdjustmentApplication } = useAdjustmentsApplicationsStore();
const { adjustmentsApplicationsForm, selectedBalanceOperation } = storeToRefs(
  useAdjustmentsApplicationsStore()
);
const { fetchOperationDetail, operationDetailResult } = useBalanceOperations();
const { fetchDetail: fetchDriverById } = useDrivers();

onMounted(async () => {
  if (route.hash?.split("/")[1] === "operations-details") {
    if (!operationDetailResult.value?.id) {
      await fetchOperationDetail({
        operation_id: Number(route.hash?.split("/")[2]),
      });
    }
    fetchDriverById({
      driver_id: operationDetailResult.value?.driver_id!,
    }).then((r) => {
      selectedBalanceOperation.value = { ...operationDetailResult.value! };
      adjustmentsApplicationsForm.value.driver_fio = getUserFullname(
        r.lastname,
        r.firstname,
        r.middlename
      );
      adjustmentsApplicationsForm.value.operation_id =
        operationDetailResult.value?.id;
      adjustmentsApplicationsForm.value.driver_id =
        operationDetailResult.value?.driver_id;
    });
  }
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Новое заявление на корректировку</h1>

    <FormsAdjustmentsApplication>
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="createAdjustmentApplication">
            Создать
          </el-button>
        </div>
      </template>
    </FormsAdjustmentsApplication>
  </UiDrawerWrapper>
</template>

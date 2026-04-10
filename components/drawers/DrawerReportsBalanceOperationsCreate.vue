<script setup lang="ts">
import { ref, watch } from "vue";
import { useReportsBalanceOperations } from "@/composables/useReports";
import { useHelpers } from "@/composables/useHelpers";
import { useBalanceOperations } from "@/composables/useBalanceOperations";

import AutocompleteDriver from "@/components/autocomplete/AutocompleteDriver.vue";
import AutocompleteVehicle from "../autocomplete/AutocompleteVehicle.vue";
import type { IDriver } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";

const { dateKeydownMask } = useHelpers();
const { optionsOperationCategories } = useBalanceOperations();
const {
  reportBalanceOperationLoading,
  balanceOperationReportRef,
  balanceOperationReportRules,
  balanceOperationReportForm,
  handleCreateBalanceOperationsReport,
} = useReportsBalanceOperations();

const searchDriver = ref("");
const searchVehicle = ref("");

watch(searchDriver, (v) => {
  if (!v) {
    balanceOperationReportForm.value.driver_id = undefined;
  }
});
watch(searchVehicle, (v) => {
  if (!v) {
    balanceOperationReportForm.value.vehicle_id = undefined;
  }
});

const handleDriverSelect = (item: IDriver) => {
  balanceOperationReportForm.value.driver_id = item.id;
};
const handleVehicleSelect = (item: IVehicle) => {
  balanceOperationReportForm.value.vehicle_id = item.id;
};
</script>

<template>
  <UiDrawerWrapper>
    <div class="h-full flex flex-col gap-3">
      <h1 class="px-5 pt-5 text-lg font-medium">
        {{ "Подробный отчет по расчетам/операциям" }}
      </h1>

      <div class="flex-1 px-5">
        <el-form
          ref="balanceOperationReportRef"
          :model="balanceOperationReportForm"
          :rules="balanceOperationReportRules"
          label-width="auto"
          class="max-w-[524px] mx-auto"
        >
          <el-form-item label="Дата начала" prop="start_date">
            <el-date-picker :clearable="false"
              v-model="balanceOperationReportForm.start_date"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              format="DD.MM.YYYY"
              @keydown="dateKeydownMask"
            />
          </el-form-item>
          <el-form-item label="Дата конца" prop="end_date">
            <el-date-picker :clearable="false"
              v-model="balanceOperationReportForm.end_date"
              type="date"
              placeholder="ДД.ММ.ГГГГ"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              format="DD.MM.YYYY"
              @keydown="dateKeydownMask"
            />
          </el-form-item>
          <el-form-item label="Вид операции" prop="operation_categories">
            <el-select
              v-model="balanceOperationReportForm.operation_categories"
              placeholder="Не выбран"
              multiple
            >
              <el-option
                v-for="item in optionsOperationCategories"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Выберите водителя" prop="driver_id">
            <AutocompleteDriver
              class="w-full"
              v-model="searchDriver"
              :placeholder="'Не выбран'"
              clearable
              @handle-select="handleDriverSelect"
            />
          </el-form-item>
          <el-form-item label="Выберите машину" prop="vehicle_id">
            <AutocompleteVehicle
              v-model="searchVehicle"
              class="w-full"
              :placeholder="'Не выбран'"
              clearable
              @handle-select="handleVehicleSelect"
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="footer flex justify-end">
        <el-button
          :loading="reportBalanceOperationLoading"
          type="primary"
          @click="handleCreateBalanceOperationsReport"
          >Создать</el-button
        >
      </div>
    </div>
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-main) {
  padding: 0 !important;
}
.footer {
  height: 62px;
  padding-right: 70px;
  padding-top: 10px;
  box-shadow: var(--light-box-shadow-dark);
}
</style>

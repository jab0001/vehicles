<script setup lang="ts">
import { ref, watch } from "vue";
import { useReportsFines } from "@/composables/useReports";
import { useHelpers } from "@/composables/useHelpers";

import AutocompleteDriver from "@/components/autocomplete/AutocompleteDriver.vue";
import AutocompleteVehicle from "../autocomplete/AutocompleteVehicle.vue";
import type { IDriver } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";
import type { TFineDatetimeType } from "@/types/fines";
import { useFinesStore } from "@/stores/finesStore";

const { dateKeydownMask } = useHelpers();

const {
  finesReportRef,
  finesReportRules,
  finesReportForm,
  handleCreateFinesReport,
} = useReportsFines();

const { finesStatuses, finesLocalStatuses } = useFinesStore();

const searchDriver = ref("");
const searchVehicle = ref("");
const daterange = ref([]);

const finesSources: {
  label: string;
  key: "internal" | "external";
}[] = [
  { label: "Внутренний", key: "internal" },
  { label: "Внешний", key: "external" },
];

const datetimeTypes: {
  name: string;
  key: TFineDatetimeType;
}[] = [
  { name: "дате ввода", key: "created_at" },
  { name: "дате пост-ния", key: "bill_date" },
  { name: "дате штрафа", key: "issued_date" },
];

watch(daterange, (v) => {
  if (v?.length) {
    finesReportForm.value.datetime_start = v[0];
    finesReportForm.value.datetime_end = v[1];
  } else {
    finesReportForm.value.datetime_start = "";
    finesReportForm.value.datetime_end = "";
  }
});
watch(searchDriver, (v) => {
  if (!v) {
    finesReportForm.value.driver_id = undefined;
  }
});
watch(searchVehicle, (v) => {
  if (!v) {
    finesReportForm.value.vehicle_id = undefined;
  }
});

const handleDriverSelect = (item: IDriver) => {
  finesReportForm.value.driver_id = item.id;
};
const handleVehicleSelect = (item: IVehicle) => {
  finesReportForm.value.vehicle_id = item.id;
};
</script>

<template>
  <UiDrawerWrapper>
    <div class="h-full flex flex-col gap-3">
      <h1 class="px-5 pt-5 text-lg font-medium">
        {{ "Отчет по штрафам" }}
      </h1>

      <div class="flex-1 px-5">
        <el-form
          ref="finesReportRef"
          :model="finesReportForm"
          :rules="finesReportRules"
          label-width="auto"
          class="max-w-[524px] mx-auto"
        >
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
          <el-form-item label="Источник"
            ><el-select
              v-model="finesReportForm.fine_source"
              class="w-full"
              placeholder="Не выбран"
              clearable
            >
              <el-option
                v-for="item in finesSources"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Статус в ГИБДД">
            <el-select
              v-model="finesReportForm.fine_statuses"
              class="w-full"
              placeholder="Не выбран"
              clearable
              multiple
            >
              <el-option
                v-for="item in finesStatuses"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Статус водителя">
            <el-select
              v-model="finesReportForm.local_statuses"
              class="w-full"
              placeholder="Не выбран"
              clearable
              multiple
            >
              <el-option
                v-for="item in finesLocalStatuses"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              /> </el-select
          ></el-form-item>
          <el-form-item label="Период по" prop="datetime_type">
            <el-select v-model="finesReportForm.datetime_type" class="w-full">
              <el-option
                v-for="item in datetimeTypes"
                :label="item.name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="
              finesReportForm.datetime_type === 'created_at'
                ? 'Дата получения штрафа'
                : 'Дата постановления'
            "
            prop="start_date"
            class="min-w-[180px]"
          >
            <el-date-picker
              :clearable="false"
              v-model="daterange"
              class="w-full"
              type="daterange"
              start-placeholder="Начало"
              end-placeholder="Конец"
              value-format="YYYY-MM-DD"
              format="DD.MM.YYYY"
              @keydown="dateKeydownMask"
            >
              <template #range-separator>до</template>
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>

      <div class="footer flex justify-end">
        <el-button type="primary" @click="handleCreateFinesReport"
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
:deep(.el-form-item__label) {
  min-width: 180px;
}
.footer {
  height: 62px;
  padding-right: 70px;
  padding-top: 10px;
  box-shadow: var(--light-box-shadow-dark);
}
</style>

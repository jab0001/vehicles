<script setup lang="ts">
import { ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";

import { useDrivers } from "@/composables/useDrivers";
import { useVehicles } from "@/composables/useVehicles";

import type { IDriver } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";
import { storeToRefs } from "pinia";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "handle-select", v: IDriver | IVehicle): void;
}>();

const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
  }>(),
  {
    triggerOnFocus: true,
  }
);

const model = defineModel({ default: "" });
const { fetchDrivers, drivers } = useDrivers();
const { fetchVehicles, vehicles } = useVehicles();

const querySearch = (query: string, cb: (v: any) => void) => {
  Promise.all([
    fetchDrivers({
      page: 1,
      limit: 10,
      query,
    }),
    fetchVehicles({
      company_ids: currentCompaniesIdsList.value,
      limit: 10,
      page: 1,
      query,
    }),
  ])
    .then(() => {
      cb([
        ...drivers.value?.map((d) => ({ ...d, driver_id: d.id })),
        ...vehicles.value?.map((v) => ({ ...v, vehicle_id: v.id })),
      ]);
    })
    .catch((err) => console.log(err));
};
const handleSelect = (item: any) => {
  emit("handle-select", item as IDriver | IVehicle);
};
</script>

<template>
  <el-autocomplete
    v-model="model"
    :fetch-suggestions="querySearch"
    :trigger-on-focus="triggerOnFocus"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    value-key="fullname"
    @select="handleSelect"
  >
    <template #prefix>
      <el-icon class="el-input__icon">
        <Search />
      </el-icon>
    </template>
    <template #default="{ item }">
      <span class="link">{{ item.fullname }}</span>
    </template>
  </el-autocomplete>
</template>

<style scoped></style>

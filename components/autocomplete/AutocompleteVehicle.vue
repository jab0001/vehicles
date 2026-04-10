<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useVehicles } from "@/composables/useVehicles";
import type { IVehicle } from "@/types/vehicles";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "clear"): void;
  (e: "handle-select", v: IVehicle): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
    onLineStatus?: boolean | undefined;
    disposal?: boolean | undefined;
    onLink?: () => void;
  }>(),
  {
    triggerOnFocus: true,
    onLineStatus: undefined,
    disposal: undefined
  }
);

const model = defineModel({ default: "" });
const { fetchVehicles, vehicles } = useVehicles();
const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);

const vehicleQuerySearch = (
  queryString: string,
  cb: (v: IVehicle[]) => void
) => {
  fetchVehicles({
    company_ids: currentCompaniesIdsList.value,
    limit: 10,
    page: 1,
    order_by: "created_at",
    direction: "desc",
    query: queryString,
    is_on_line: props.onLineStatus,
    disposal: props.disposal
  }).then(() => cb(vehicles.value));
};
const handleVehicleSelect = (item: any) => {
  emit("handle-select", item as IVehicle);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="vehicleQuerySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="fullname"
      :clearable="clearable"
      @select="handleVehicleSelect"
      @clear="emit('clear')"
    >
      <template v-if="!model" #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
      <template #default="{ item }">
        <span class="link">{{ item.fullname }}</span>
      </template>
    </el-autocomplete>
    <el-icon class="cursor-pointer" v-if="onLink" @click="onLink">
      <Link />
    </el-icon>
  </div>
</template>

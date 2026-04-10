<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useInspections } from "@/composables/useInspections";
import type { IVehicle } from "@/types/vehicles";
import type { IInspections } from "@/types/inspections";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "handle-select", v: IVehicle): void;
}>();
const props = withDefaults(
  defineProps<{
    driverId?: number;
    vehicleId?: number;
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
    onLink?: () => void;
  }>(),
  {
    triggerOnFocus: true,
  }
);

const model = defineModel({ default: "" });
const { fetchInspections, inspections } = useInspections();

const inspectionQuerySearch = (
  queryString: string,
  cb: (v: IInspections[]) => void
) => {
  fetchInspections({
    limit: 10,
    page: 1,
    driver_id: props.driverId,
    vehicle_id: props.vehicleId,
    order_by: "created_at",
    direction: "desc",
  }).then(() => cb(inspections.value));
};
const handleSelect = (item: any) => {
  emit("handle-select", item as IVehicle);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="inspectionQuerySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="fullname"
      :clearable="clearable"
      @select="handleSelect"
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

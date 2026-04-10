<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useDrivers } from "@/composables/useDrivers";
import type { IDriver } from "@/types/drivers";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "clear"): void;
  (e: "handle-select", v: IDriver): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
    vehicleId?: number;
    canBeEmpty?: boolean;
    onLink?: () => void;
  }>(),
  {
    triggerOnFocus: true,
  }
);

const model = defineModel({ default: "" });
const { fetchDrivers, drivers } = useDrivers();

const querySearch = (queryString: string, cb: (v: IDriver[]) => void) => {
  fetchDrivers({
    page: 1,
    limit: 10,
    r_on_vehicle_id: props.vehicleId,
    query: queryString,
  }).then(() => {
    const results = [...drivers.value];
    if (props.canBeEmpty) {
      results.unshift({
        id: null,
        fullname: "Без водителя",
      } as unknown as IDriver);
    }
    cb(results);
  });
};
const handleDriverSelect = (item: any) => {
  emit("handle-select", item as IDriver);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="fullname"
      :clearable="clearable"
      @select="handleDriverSelect"
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

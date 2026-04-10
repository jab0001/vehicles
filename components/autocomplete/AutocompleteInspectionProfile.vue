<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import {
  useInspectionProfiles,
  type IInspectionProfile,
} from "@/composables/useInspectionProfiles";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "handle-select", v: IInspectionProfile): void;
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
const { fetchInspectionProfiles } = useInspectionProfiles();

const inspectionQuerySearch = (
  queryString: string,
  cb: (v: IInspectionProfile[]) => void
) => {
  fetchInspectionProfiles({
    limit: 10,
    page: 1,
    search: queryString
  }).then((v) => cb(v.items));
};
const handleSelect = (item: any) => {
  emit("handle-select", item as IInspectionProfile);
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
      value-key="name"
      :clearable="clearable"
      @select="handleSelect"
    >
      <template v-if="!model" #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
      <template #default="{ item }">
        <span class="link">{{ item.name }}</span>
      </template>
    </el-autocomplete>
    <el-icon class="cursor-pointer" v-if="onLink" @click="onLink">
      <Link />
    </el-icon>
  </div>
</template>

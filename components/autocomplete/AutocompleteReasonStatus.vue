<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useReasonChangingStatus } from "@/composables/useReasonChangingStatus";
import type { IReasonChangingStatus } from "@/types/reasonChangingStatus";

const emit = defineEmits<{
  (e: "close-modal"): void;
  (e: "clear"): void;
  (e: "handle-select", v: IReasonChangingStatus): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
    vehicleId?: number;
    onLink?: () => void;
  }>(),
  {
    triggerOnFocus: true,
  }
);

const model = defineModel({ default: "" });
const { fetchReasonChangingStatusList, reasonChangingList } =
  useReasonChangingStatus();

const querySearch = (
  queryString: string,
  cb: (v: IReasonChangingStatus[]) => void
) => {
  fetchReasonChangingStatusList({
    page: 1,
    limit: 10,
    search: queryString,
  }).then(() => cb(reasonChangingList.value));
};
const handleDriverSelect = (item: any) => {
  emit("handle-select", item as IReasonChangingStatus);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="name"
      :clearable="clearable"
      @select="handleDriverSelect"
      @clear="emit('clear')"
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

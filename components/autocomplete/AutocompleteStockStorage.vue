<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useStocks } from "@/composables/useStocks";
import type { IStock } from "@/types/stocks";

const emit = defineEmits<{
  (e: "handle-select", v: IStock): void;
  (e: "clear"): void;
}>();
const props = withDefaults(
  defineProps<{
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
const { fetchStocksList, stocksList } = useStocks();

const stockStorageQuerySearch = (
  queryString: string,
  cb: (v: IStock[]) => void
) => {
  fetchStocksList({
    limit: 10,
    page: 1,
    search: queryString,
  }).then(() => cb(stocksList.value));
};
const handleStockStorageSelect = (item: any) => {
  emit("handle-select", item as IStock);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="stockStorageQuerySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="name"
      :clearable="clearable"
      @select="handleStockStorageSelect"
      @clear="emit('clear')"
    >
      <template v-if="!model" #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
      <template #default="{ item }">
        <span class="link">{{ item.name }}</span>
      </template>
    </el-autocomplete>
    <!-- <el-icon class="cursor-pointer" v-if="onLink" @click="onLink">
      <Link />
    </el-icon> -->
  </div>
</template>

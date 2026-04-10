<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useStocksCostItems } from "@/composables/useStocks";
import type { IStockCostItem } from "@/types/stocks";

const emit = defineEmits<{
  (e: "handle-select", v: IStockCostItem): void;
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
const { fetchCostItemsList, costItemsList } = useStocksCostItems();

const stockCostItemQuerySearch = (
  queryString: string,
  cb: (v: IStockCostItem[]) => void
) => {
  fetchCostItemsList({
    limit: 10,
    page: 1,
    search: queryString,
  }).then(() => cb(costItemsList.value));
};
const handleStockCostItemSelect = (item: any) => {
  emit("handle-select", item as IStockCostItem);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="stockCostItemQuerySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="name"
      :clearable="clearable"
      @select="handleStockCostItemSelect"
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

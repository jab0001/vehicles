<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch, watchEffect } from "vue";
import type { IStock } from "@/types/stocks";
import { useStocks, useStocksBalance } from "@/composables/useStocks";
import { storeToRefs } from "pinia";
import { useStocksBalanceStore } from "@/stores/stocksStore";

const emit = defineEmits<{
  (e: "update:modelValue", v: IStock[]): void;
  (e: "handle-select", v: IStock[]): void;
  (e: "clear"): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue: IStock[];
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
  }>(),
  {
    modelValue: () => [],
  }
);

const searchQuery = ref("");
const elSelectRef = ref();
const { fetchStocksList, stocksList } = useStocks();
const { selectedStocks } = storeToRefs(useStocksBalanceStore());

const loadOptions = async (query: string) => {
  searchQuery.value = query;
  await fetchStocksList({
    page: 1,
    limit: 10,
    search: query,
  });
};

watch(
  () => props.modelValue,
  (val) => {
    const current = selectedStocks.value;
    if (
      val.length !== current.length ||
      val.some((v, i) => v.id !== current[i]?.id)
    ) {
      selectedStocks.value = [...val];
    }
  }
);

watch(selectedStocks, (val) => {
  emit("update:modelValue", val);
  emit("handle-select", val);

  nextTick(() => {
    elSelectRef.value?.blur();
    elSelectRef.value?.focus();
  });
});

const handleClear = () => {
  emit("clear");
};

onUnmounted(() => {
  selectedStocks.value = [];
});
</script>

<template>
  <el-select
    ref="elSelectRef"
    v-model="selectedStocks"
    multiple
    filterable
    remote
    reserve-keyword
    :remote-method="loadOptions"
    :clearable="clearable"
    :disabled="disabled"
    :placeholder="placeholder"
    value-key="id"
    class="w-fit min-w-[280px]"
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="4"
    @clear="handleClear"
  >
    <el-option
      v-for="item in stocksList"
      :key="item.id"
      :label="item.name"
      :value="item"
    />
  </el-select>
</template>

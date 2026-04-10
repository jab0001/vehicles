<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useCheckExtra } from "@/composables/useCheckExtra";
import { useStocksNomenclatureStore } from "@/stores/stocksStore";
import { storeToRefs } from "pinia";

const emit = defineEmits<{
  (e: "handle-select", v: any): void;
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
const { nomenclatureGroups } = storeToRefs(useStocksNomenclatureStore());

const stockStorageQuerySearch = (
  queryString: string,
  cb: (v: any[]) => void
) => {
  if (queryString.trim() === "") {
    cb(nomenclatureGroups.value ?? []);
    return;
  }
  cb(
    nomenclatureGroups.value?.filter((item) =>
      item.toLowerCase().includes(queryString.toLowerCase())
    ) ?? []
  );
};
const handlePartSelect = (item: any) => {
  model.value = item;
  emit("handle-select", item);
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
      value-key="undefined"
      :clearable="clearable"
      @change="handlePartSelect"
      @select="handlePartSelect"
      @clear="emit('clear')"
    >
      <template v-if="!model" #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
      <template #default="{ item }">
        <span class="link">{{ item }}</span>
      </template>
    </el-autocomplete>
  </div>
</template>

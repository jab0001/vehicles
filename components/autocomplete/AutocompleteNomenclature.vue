<script setup lang="ts">
import { ArrowDown, Link } from "@element-plus/icons-vue";
import { useStocksNomenclature } from "@/composables/useStocks";
import type { INomenclature, TNomenclatureType } from "@/types/stocks";

const emit = defineEmits<{
  (e: "handle-select", v: INomenclature): void;
  (e: "clear"): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    triggerOnFocus?: boolean;
    type?: TNomenclatureType;
    onLink?: () => void;
  }>(),
  {
    triggerOnFocus: true,
    type: "ITEM",
  }
);

const model = defineModel({ default: "" });
const {
  nomenclatureListWithoutPagination,
  fetchnomenclatureWithoutPaginationList,
} = useStocksNomenclature();

const nomenclatureQuerySearch = (
  queryString: string,
  cb: (v: INomenclature[]) => void
) => {
  fetchnomenclatureWithoutPaginationList({
    nomenclature_type: props.type,
    search: queryString,
  }).then(() => cb(nomenclatureListWithoutPagination.value ?? []));
};
const handleNomenclatureSelect = (item: any) => {
  emit("handle-select", item as INomenclature);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full">
    <el-autocomplete
      v-model="model"
      class="flex-1"
      :fetch-suggestions="nomenclatureQuerySearch"
      :trigger-on-focus="triggerOnFocus"
      :placeholder="placeholder"
      :disabled="disabled"
      value-key="name"
      :clearable="clearable"
      @select="handleNomenclatureSelect"
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

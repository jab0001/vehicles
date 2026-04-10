<script setup lang="ts">
import { Calendar } from "@element-plus/icons-vue";
import UiSearch from "@/components/ui/UiSearch.vue";

const emit = defineEmits<{
  (e: "openDaterange"): void;
}>();
defineProps<{
  badgeVisible?: boolean;
  placeholder?: string;
}>();
const model = defineModel("search", { default: "" });
</script>

<template>
  <div
    class="sticky top-0 w-full flex items-center gap-2 bg-[var(--border-color-light)] py-4 z-10"
  >
    <UiSearch
      v-model="model"
      class="w-full"
      :placeholder="placeholder ? placeholder : 'Поиск по № постановления'"
      :size="'large'"
    />

    <div
      class="relative shrink-0 w-10 h-10 flex items-center justify-center bg-[var(--fill-color-light)] rounded-xl"
      @click="emit('openDaterange')"
    >
      <p
        v-if="badgeVisible"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--text-color-error)] border-2 border-[var(--fill-color-light)] transition-all"
      ></p>
      <el-icon color="#409EFF" size="20"><Calendar /></el-icon>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input) {
  --el-input-border-radius: var(--border-radius-xl);
  --el-input-bg-color: var(--fill-color-light);
}
</style>

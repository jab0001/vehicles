<script setup lang="ts">
import {  ref } from "vue";
import { useAppDriverInspections } from "@/composables/useAppDriver";

const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const {
  appDriverInspectionSettingsResponse,
  fetchAppDriverInspectionsSettings,
} = useAppDriverInspections();

fetchAppDriverInspectionsSettings({
  inspection_type: "mobile",
  detail: true,
});

const checkList = ref([]);

const extras = defineModel({
  required: true,
});

extras.value = checkList.value;
</script>

<template>
  <div class="flex-1 flex flex-col gap-4">
    <section class="flex-grow flex flex-col justify-center items-center">
      <p
        class="max-w-72 text-[var(--text-color-regular)] mb-6 mx-auto text-base text-center"
      >
        Проверьте комплектацию. Снимите галочку, если чего-то не хватает
      </p>

      <el-checkbox-group v-model="checkList" class="w-full flex flex-col gap-1">
        <div
          class="p-4 rounded-xl bg-[var(--fill-color-light)] border border-[var(--border-color-light)]"
          v-for="item in 3"
        >
          <el-checkbox label="Option A" value="Value A" />
        </div>
      </el-checkbox-group>
    </section>
    <el-button
      class="w-full rounded-xl"
      type="primary"
      size="large"
      @click="emit('onNext')"
      >Едем дальше
    </el-button>
  </div>
</template>

<style scoped>
:deep(.el-checkbox__inner) {
  height: 24px;
  width: 24px;
}
:deep(.el-checkbox__inner::after) {
  left: 9px;
  top: 5px;
  height: 9px;
  border-width: 2.5px;
}
:deep(.el-checkbox__label) {
  padding-left: 12px;
  color: #606266;
  font-size: 16px;
  line-height: 24px;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #67c23a;
  border-color: #67c23a;
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #606266;
}
</style>

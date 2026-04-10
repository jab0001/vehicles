<script setup lang="ts">
import { computed } from "vue";
import AppDriverUiInspectionUpload from "../ui/AppDriverUiInspectionUpload.vue";
const emit = defineEmits<{
  (e: "onCreate"): void;
}>();

const tags = ["СТС", "Лицензия", "ОСАГО", "Диагностическая карта"];

const documentsImage = defineModel<any[]>({
  required: true,
});

const canProceed = computed(() => {
  if (documentsImage.value.length === 0) return true;

  return documentsImage.value.every(
    (file) => (file as any).status === "success"
  );
});
</script>

<template>
  <div class="flex-1 flex flex-col justify-between gap-4 mt-8">
    <section class="flex-grow flex flex-col justify-center items-center gap-6">
      <p
        v-if="!documentsImage.length"
        class="max-w-64 text-[var(--text-color-regular)] mb-6 mx-auto text-base text-center"
      >
        Последний шаг: добавьте одно фото, где видно все документы
      </p>

      <AppDriverUiInspectionUpload
        :class="{
          'p-4': documentsImage.length,
          'bg-transparent border-0': !documentsImage.length,
        }"
        v-model="documentsImage"
        :hideTipWithoutData="!documentsImage.length"
        tip="СТС, Лицензия, ОСАГО, Диагностическая карта"
        part="VEHICLE_DOCUMENTS"
      >
        <img
          v-if="!documentsImage.length"
          src="@/assets/images/app-driver-set-photo.png"
          alt=""
        />
      </AppDriverUiInspectionUpload>

      <div v-if="!documentsImage.length" class="mt-20">
        <p
          class="text-[var(--text-color-regular)] mb-5 mx-auto text-base text-center"
        >
          Какие документы нужны:
        </p>
        <div class="flex flex-wrap justify-center gap-1.5">
          <el-tag
            color="var(--color-warning-light-8)"
            type="warning"
            v-for="tag in tags"
            >{{ tag }}</el-tag
          >
        </div>
      </div>

      <div v-else>
        <p
          class="max-w-80 text-[var(--text-color-regular)] mx-auto text-base text-center"
        >
          Если что, это всё! Нажмите на кнопку ниже, чтобы завершить осмотр
        </p>
      </div>
    </section>

    <el-button
      class="w-full rounded-xl"
      type="primary"
      size="large"
      v-if="documentsImage.length"
      :loading="!canProceed"
      @click="emit('onCreate')"
      >Завершить осмотр
    </el-button>
  </div>
</template>

<style scoped>
:deep(.el-tag) {
  box-sizing: initial;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 18px;
  line-height: 26px;
}

:deep(.el-upload-list--picture .el-upload-list__item) {
  width: 189px;
  height: 152px;
}
</style>

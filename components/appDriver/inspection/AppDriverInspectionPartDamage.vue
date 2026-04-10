<script setup lang="ts">
import { ref } from "vue";
import AppDriverUiInspectionUpload from "../ui/AppDriverUiInspectionUpload.vue";
const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const bodyFrontImage = ref<any>([]);
</script>

<template>
  <div class="flex-1 flex flex-col gap-4">
    <section class="flex-grow flex flex-col justify-center items-center gap-10">
      <AppDriverUiInspectionUpload
        :class="{
          'p-4 w-full !items-start': bodyFrontImage.length,
          'bg-transparent border-0': !bodyFrontImage.length,
        }"
        v-model="bodyFrontImage"
      >
        <img v-if="!bodyFrontImage.length" src="@/assets/images/app-driver-set-photo.png" alt="" />

        <template #file="{ file }">
          <div>
            <img class="object-cover" :src="file.url" alt="" />
          </div>
        </template>
      </AppDriverUiInspectionUpload>
      <p
        class="max-w-72 text-[var(--text-color-regular)] mb-6 mx-auto text-base text-center"
      >
        Всякое могло случиться, если есть ущерб, лучше его зафиксировать
      </p>
    </section>
    <el-button
      class="w-full rounded-xl"
      type="primary"
      size="large"
      @click="emit('onNext')"
      >Пропустить шаг
    </el-button>
  </div>
</template>

<style scoped></style>

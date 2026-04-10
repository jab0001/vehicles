<script setup lang="ts">
import { computed, ref } from "vue";
import AppDriverUiInspectionUpload from "../ui/AppDriverUiInspectionUpload.vue";
import type { IUploadedServerFile } from "@/composables/useFiles";
import type { UploadUserFile } from "element-plus";

const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const images = defineModel<{
  front: IUploadedServerFile[] | UploadUserFile[];
  left: IUploadedServerFile[] | UploadUserFile[];
  right: IUploadedServerFile[] | UploadUserFile[];
  rear: IUploadedServerFile[] | UploadUserFile[];
}>({
  required: true,
});

const allFiles = computed(() => [
  ...images.value.front,
  ...images.value.left,
  ...images.value.right,
  ...images.value.rear,
]);

const canProceed = computed(() => {
  if (allFiles.value.length === 0) return true;

  return allFiles.value.every(
    (file) => (file as any).status === "success"
  );
});
</script>

<template>
  <div class="flex-1 flex flex-col justify-between gap-4">
    <section class="mt-10">
      <p
        class="max-w-64 text-[var(--text-color-regular)] mb-6 mx-auto text-base text-center"
      >
        Как там автомобиль снаружи? Приложите фото
      </p>

      <div class="w-full flex flex-col gap-3 items-center justify-center">
        <AppDriverUiInspectionUpload
          class="w-full h-32"
          v-model="images.front"
          tip="Спереди"
          part="VEHICLE_BODY_FRONT"
        />
        <div class="w-full flex gap-3">
          <AppDriverUiInspectionUpload
            class="flex-1"
            v-model="images.left"
            tip="Слева"
            part="VEHICLE_BODY_LEFT"
          />
          <img
            src="@/assets/images/app-driver-inspection-exterior.png"
            alt=""
          />
          <AppDriverUiInspectionUpload
            class="flex-1"
            v-model="images.right"
            tip="Справа"
            part="VEHICLE_BODY_RIGHT"
          />
        </div>
        <AppDriverUiInspectionUpload
          class="w-full h-32"
          v-model="images.rear"
          tip="Сзади"
          part="VEHICLE_BODY_REAR"
        />
      </div>
    </section>

    <el-button
      class="w-full rounded-xl"
      type="primary"
      size="large"
      :loading="!canProceed"
      @click="emit('onNext')"
      >{{
        !images.front.length
          ? "Сначала загрузите все фото"
          : "По экстерьеру всё"
      }}
    </el-button>
  </div>
</template>

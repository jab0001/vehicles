<script setup lang="ts">
import type { IUploadedServerFile } from "@/composables/useFiles";
import AppDriverUiInspectionUpload from "../ui/AppDriverUiInspectionUpload.vue";
import type { UploadUserFile } from "element-plus";
import { computed } from "vue";

const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const interiorImages = defineModel<{
  rearSeats: IUploadedServerFile[] | UploadUserFile[];
  frontSeats: IUploadedServerFile[] | UploadUserFile[];
  trunk: IUploadedServerFile[] | UploadUserFile[];
  dashboard: IUploadedServerFile[] | UploadUserFile[];
}>({
  required: true,
});

const allFiles = computed(() => [
  ...interiorImages.value.rearSeats,
  ...interiorImages.value.frontSeats,
  ...interiorImages.value.trunk,
  ...interiorImages.value.dashboard,
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
        class="max-w-52 text-[var(--text-color-regular)] mb-6 mx-auto text-base text-center"
      >
        Внутри все хорошо? Зафиксируйте
      </p>

      <div class="w-full flex flex-col gap-3 items-center justify-center">
        <div class="w-full flex items-center gap-3">
          <AppDriverUiInspectionUpload
            class="flex-1 h-[189px]"
            v-model="interiorImages.rearSeats"
            tip="Задние сиденья"
            part="VEHICLE_INTERIOR_REAR_SEAT"
          />
          <AppDriverUiInspectionUpload
            class="flex-1 h-[189px]"
            v-model="interiorImages.frontSeats"
            tip="Передние сиденья"
            part="VEHICLE_INTERIOR_FRONT_SEAT"
          />
        </div>
        <img src="@/assets/images/app-driver-inspection-salon.png" alt="" />
        <div class="w-full flex items-center gap-3">
          <AppDriverUiInspectionUpload
            class="flex-1 h-[189px]"
            v-model="interiorImages.trunk"
            tip="Багажник"
            part="VEHICLE_INTERIOR_TRUNK"
          />
          <AppDriverUiInspectionUpload
            class="flex-1 h-[189px]"
            v-model="interiorImages.dashboard"
            tip="Торпеда"
            part="VEHICLE_INTERIOR_DASHBOARD"
          />
        </div>
      </div>
    </section>

    <el-button
      class="w-full rounded-xl"
      type="primary"
      size="large"
      :loading="!canProceed"
      @click="emit('onNext')"
      >Далее
    </el-button>
  </div>
</template>

<style scoped></style>

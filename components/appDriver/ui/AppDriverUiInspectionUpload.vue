<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppDriverFiles } from "@/composables/useAppDriver";
import { Delete, Plus, ZoomIn } from "@element-plus/icons-vue";
import { type IUploadedServerFile } from "@/composables/useFiles";
import type { UploadUserFile } from "element-plus";

const { uploadFileList } = useAppDriverFiles();

type VehicleInspectionPartType =
  | "VEHICLE_BODY_FRONT"
  | "VEHICLE_BODY_RIGHT"
  | "VEHICLE_BODY_LEFT"
  | "VEHICLE_BODY_REAR"
  | "VEHICLE_INTERIOR_DASHBOARD"
  | "VEHICLE_INTERIOR_FRONT_SEAT"
  | "VEHICLE_INTERIOR_REAR_SEAT"
  | "VEHICLE_INTERIOR_TRUNK"
  | "VEHICLE_DOCUMENTS";

const {
  tip,
  hideTipWithoutData,
  limit = 1,
  accept = "image/*",
  part,
} = defineProps<{
  tip?: string;
  hideTipWithoutData?: boolean;
  limit?: number;
  accept?: string;
  part: VehicleInspectionPartType;
  disabled?: boolean;
}>();

const model = defineModel<IUploadedServerFile[] | UploadUserFile[]>({
  required: true,
});
const uploadRef = ref<any>();
const dialogVisible = ref(false);
const imgPreviewVisible = ref(false);

const handleClick = () => {
  if (!model.value?.length) return;
  dialogVisible.value = true;
};

watch(
  () => model.value,
  async (newVal) => {
    if (newVal?.length) {
      await handleFileUpload();
    }
  }
);

const handleFileUpload = async () => {
  try {
    const result = await uploadFileList(model.value!, part);
    if (result?.length) {
      model.value = result;
    }
  } catch (error) {
    console.error("Error uploading files:", error);
  }
};

const handleDeleteFile = () => {
  uploadRef.value.clearFiles();
  dialogVisible.value = false;
};

const beforeClose = (done: () => void) => {
  if (imgPreviewVisible.value) {
    imgPreviewVisible.value = false;
    return;
  }
  done();
};
</script>

<template>
  <div
    class="flex items-center justify-center flex-col gap-1.5 rounded-xl bg-[var(--fill-color-light)] border border-[var(--border-color-light)]"
    @click="handleClick"
  >
    <el-upload
      :disabled="disabled"
      ref="uploadRef"
      :show-file-list="true"
      v-model:file-list="model"
      :accept="accept"
      :auto-upload="false"
      list-type="picture"
      :limit="limit"
      @click.stop
    >
      <template #file="{ file }">
        <div @click="handleClick" class="mx-auto">
          <slot name="file" :file="file">
            <div>
              <img class="object-cover object-center" :src="file.url" alt="" />
            </div>
          </slot>
        </div>
      </template>

      <slot>
        <div
          v-if="!model.length"
          class="w-20 h-16 flex items-center justify-center bg-white rounded border border-dashed"
        >
          <el-icon color="#409EFF" size="28">
            <Plus />
          </el-icon>
        </div>
      </slot>
    </el-upload>

    <template v-if="tip">
      <p
        v-if="!hideTipWithoutData"
        class="max-w-48 text-[var(--text-color-regular)] text-sm text-center"
      >
        {{ tip }}
      </p>
    </template>

    <el-dialog
      width="80%"
      v-model="dialogVisible"
      append-to="html"
      align-center
      @close="dialogVisible = false"
      :before-close="beforeClose"
    >
      <div v-if="!imgPreviewVisible" class="flex flex-col gap-4 p-8">
        <div
          class="flex items-center justify-center gap-2 p-2 rounded-xl bg-[var(--color-primary-light-7)]"
          @click="imgPreviewVisible = true"
        >
          Просмотреть <el-icon><ZoomIn /></el-icon>
        </div>
        <div
          class="flex items-center justify-center gap-2 p-2 rounded-xl bg-[var(--text-color-error)]"
          @click="handleDeleteFile"
        >
          Удалить <el-icon><Delete /></el-icon>
        </div>
      </div>

      <div v-else>
        <img
          :src="model[0].url"
          class="w-full h-full object-cover object-center"
          alt=""
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.el-upload) {
  display: flex;
}
:deep(.el-upload-list--picture) {
  margin: 0;
}
:deep(.el-upload-list--picture .el-upload-list__item) {
  width: 80px;
  height: 64px;
  margin: 0;
  padding: 0;
}
</style>

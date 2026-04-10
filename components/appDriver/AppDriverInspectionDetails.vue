<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import { useInspections } from "@/composables/useInspections";
import {
  useAppDriverInspections,
  type IUploadedServerFile,
} from "@/composables/useAppDriver";
import { formatDayTime } from "@/helpers/format.helpers";
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import { useAppDriverFiles } from "@/composables/useAppDriver";
import {
  InspectionSignatureStatusType,
  type IInspections,
} from "@/types/inspections";

import AppDriverBaseDesc from "./AppDriverBaseDesc.vue";

const props = defineProps<{
  inspection: IInspections;
}>();

const { fetchAppDriverInspectionFile, appDriverInspectionFileResponse } =
  useAppDriverFiles();

const {
  getInspectionTypeLabel,
  getInspectionFuelLevelLabel,
  getInspectionSignatureStatusLabel2,
} = useInspections();
const {
  appDriverInspectionSettingsResponse,
  appDriverInspectionsSettingsLoading,
  fetchAppDriverInspectionsSettings,
} = useAppDriverInspections();

const { getCarBrandById, getCarModelById } = useReferenceBooksStore();
const extraKit = ref();
const dialogVisible = ref(false);
const dialogImageUrl = ref("");
const salonAndExteriorImages = ref<string[]>([]);
const documentImages = ref<string[]>([]);

onMounted(() => {
  if (props.inspection) {
    fetchInspectionImages(props.inspection.id!, props.inspection.document_ids!);
  }
});

watch(appDriverInspectionSettingsResponse, (v) => {
  extraKit.value = props.inspection.extra
    ?.filter((i) => typeof i.value === "boolean")
    ?.map((item) => {
      const extraVal = v?.find((itemVal) => itemVal.full_key == item.key);
      return {
        title: extraVal?.title,
        value: item?.value,
      };
    });
});

const handlePictureCardPreview = (imgUrl: string) => {
  dialogImageUrl.value = imgUrl;
  dialogVisible.value = true;
};

fetchAppDriverInspectionsSettings({
  inspection_type: props.inspection.inspection_type!,
  detail: true,
});

const fetchInspectionImages = async (
  inspectionId: number,
  documentIds: number[]
) => {
  try {
    const fetchedImages = await Promise.all(
      documentIds.map(async (fileId) => {
        const blob = await fetchAppDriverInspectionFile({
          vehicle_inspection_id: inspectionId,
          file_id: fileId,
        });
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
    );

    props.inspection.documents.forEach((file, index) => {
      const imgUrl = fetchedImages[index];
      if (file.type.includes("INTERIOR") || file.type.includes("BODY")) {
        salonAndExteriorImages.value.push(imgUrl);
      } else if (file.type.includes("DOCUMENTS")) {
        documentImages.value.push(imgUrl);
      }
    });
  } catch (error) {
    console.error("Error fetching inspection images:", error);
  }
};

const getTagType = (signature: string) => {
  if (signature === InspectionSignatureStatusType.Signed) return "success";
  if (signature === InspectionSignatureStatusType.Rejected) return "danger";
  return "info";
};
</script>

<template>
  <div class="flex flex-col gap-6 px-4">
    <div class="grid grid-cols-2 gap-x-2 gap-y-6">
      <div
        v-if="
          inspection.signing_status ===
            InspectionSignatureStatusType.Rejected ||
          inspection.signing_status === InspectionSignatureStatusType.Signed
        "
        class="col-span-2"
      >
        <el-tag :type="getTagType(inspection.signing_status!)">
          {{ getInspectionSignatureStatusLabel2(inspection.signing_status!) }}
        </el-tag>
      </div>
      <AppDriverBaseDesc
        label="Дата осмотра"
        :text="formatDayTime(inspection.created_at!, true)"
      />
      <AppDriverBaseDesc
        label="Гос. номер"
        :text="inspection.vehicle?.plate_number"
      />
      <AppDriverBaseDesc
        label="Тип осмотра"
        :text="getInspectionTypeLabel(inspection.inspection_type!)"
      />
      <AppDriverBaseDesc
        label="Марка и модель"
        :text="`${getCarBrandById(inspection?.vehicle?.brand_id!)} ${getCarModelById(inspection?.vehicle?.car_model_id!)}`"
      />
      <AppDriverBaseDesc
        label="Количество топливо"
        :text="getInspectionFuelLevelLabel(inspection.fuel_left)"
      />
      <AppDriverBaseDesc
        label="Пробег"
        :text="`${inspection.current_mileage ?? 0} км`"
      />
    </div>

    <AppDriverBaseDesc class="-mr-4" label="Экстерьер и салон">
      <div
        class="flex items-center gap-3 pr-4 overflow-x-auto scroll-smooth no-scrollbar"
      >
        <img
          v-for="(imgUrl, index) in salonAndExteriorImages"
          :key="index"
          :src="imgUrl"
          class="shrink-0 w-[78px] h-16 object-cover rounded"
          @click="handlePictureCardPreview(imgUrl)"
        />
      </div>
    </AppDriverBaseDesc>

    <AppDriverBaseDesc
      v-loading="appDriverInspectionsSettingsLoading"
      label="Комплект"
    >
      <div class="flex flex-col divide-y rounded-xl bg-[var(--fill-color)]">
        <p
          class="p-2 flex items-center gap-1 text-sm leading-6 font-medium"
          v-for="item in extraKit"
        >
          <el-result :icon="!item.value ? 'error' : 'success'" />
          <span>{{ item.title }}</span>
        </p>
      </div>
    </AppDriverBaseDesc>

    <AppDriverBaseDesc label="Ущерб">
      <div class="flex flex-col divide-y rounded-xl bg-[var(--fill-color)]">
        <!-- <div class="flex items-center gap-2 p-2" v-for="_ in 2">
          <img
            src="@/assets/images/car.png"
            class="w-[60px] h-[43px] object-cover rounded"
            alt=""
          />
          <div class="font-medium">
            <p class="text-[var(--text-color-secondary)] text-sm">
              Экстерьер, спереди
            </p>
            <p class="text-xs">Вмятина на бампере и капоте</p>
          </div>
        </div> -->
      </div>
    </AppDriverBaseDesc>

    <AppDriverBaseDesc label="Документы">
      <div
        class="flex items-center gap-3 pr-4 overflow-x-auto scroll-smooth no-scrollbar"
      >
        <img
          v-for="(imgUrl, index) in documentImages"
          :key="index"
          :src="imgUrl"
          class="shrink-0 w-[78px] h-16 object-cover rounded"
          @click="handlePictureCardPreview(imgUrl)"
        />
      </div>
    </AppDriverBaseDesc>

    <Teleport to="html">
      <el-dialog width="100%" v-model="dialogVisible">
        <img
          class="px-4 mx-auto"
          w-full
          :src="dialogImageUrl"
          alt="Preview Image"
        />
      </el-dialog>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(.el-result) {
  --el-result-padding: 0;
  --el-result-icon-font-size: 20px;
}
</style>

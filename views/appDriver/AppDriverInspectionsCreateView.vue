<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElNotification, type UploadUserFile } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import {
  useAppDriverInspectionParts,
  type IUploadedServerFile,
} from "@/composables/useAppDriver";
import { useAppDriverInspections } from "@/composables/useAppDriver";
import {
  useAppDriverDriver,
  useAppDriverGroup,
} from "@/composables/useAppDriver";
import type { IInspectionAppDriverCreateParams } from "@/types/inspections";
import { useAppDriverGroupStore } from "@/stores/appDriverGroupStore";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const { partTitle, partComponent, activePart, goToPrevPart, goToNextPart } =
  useAppDriverInspectionParts();

const { createAppDriverInspection, appDriverInspectionError } =
  useAppDriverInspections();

const { appDriverVehicleInfo, fetchAppDriverVehicleInfo } =
  useAppDriverDriver();
const { receiverAccept } = useAppDriverGroupStore();
const { driverGroup } = storeToRefs(useAppDriverGroupStore());

interface InspectionPartsData {
  mileage: number | undefined;
  fuel: number | undefined;
  exterior: {
    front: IUploadedServerFile[] | UploadUserFile[];
    left: IUploadedServerFile[] | UploadUserFile[];
    right: IUploadedServerFile[] | UploadUserFile[];
    rear: IUploadedServerFile[] | UploadUserFile[];
  } | null;
  salon: {
    rearSeats: IUploadedServerFile[] | UploadUserFile[];
    frontSeats: IUploadedServerFile[] | UploadUserFile[];
    trunk: IUploadedServerFile[] | UploadUserFile[];
    dashboard: IUploadedServerFile[] | UploadUserFile[];
  } | null;
  kit: undefined;
  damage: undefined;
  documents: { id: number }[];
}

const inspectionPartsData = ref<InspectionPartsData>({
  mileage: undefined,
  fuel: undefined,
  exterior: {
    front: [],
    left: [],
    right: [],
    rear: [],
  },
  salon: {
    rearSeats: [],
    frontSeats: [],
    trunk: [],
    dashboard: [],
  },
  kit: undefined,
  damage: undefined,
  documents: [],
});

const inspectionData = computed<IInspectionAppDriverCreateParams>(() => ({
  vehicle_id: appDriverVehicleInfo.value?.id ?? driverGroup.value?.vehicle_id,
  current_mileage: Number(
    inspectionPartsData.value.mileage.replaceAll(" ", "")
  ),
  description: "",
  fuel_left: inspectionPartsData.value.fuel,
  document_ids: documentIds.value.filter(Boolean),
  extra: [],
}));

const documentIds = computed(() => {
  const ids: number[] = [];

  if (inspectionPartsData.value.exterior) {
    Object.values(inspectionPartsData.value.exterior).forEach(
      (section: any) => {
        section.forEach((item: any) => {
          if (item && item.id) {
            ids.push(item.id);
          }
        });
      }
    );
  }

  if (inspectionPartsData.value.salon) {
    Object.values(inspectionPartsData.value.salon).forEach((section: any) => {
      section.forEach((item: any) => {
        if (item && item.id) {
          ids.push(item.id);
        }
      });
    });
  }

  if (inspectionPartsData.value.documents) {
    inspectionPartsData.value.documents.forEach((item: any) => {
      if (item && item.id) {
        ids.push(item.id);
      }
    });
  }

  return ids;
});

const handleCreate = async () => {
  if (inspectionData.value.vehicle_id) {
    try {
      const h = route.hash?.split("/") ?? [];
      const result = await createAppDriverInspection(inspectionData.value);
      if (h.length) {
        try {
          await receiverAccept({
            transfer_id: h[h.length - 1],
            inspection_id: result.id!,
          });
          router.push({ name: "AppDriverDashboard" });
          ElNotification({
            type: "success",
            message: "Вы вышли на линии",
          });
        } catch (error) {
          console.log(error);
          ElNotification({
            type: "error",
            message: "Произошла ошибка",
          });
        }
      }
      router.push({ name: "AppDriverInspections" });
      ElNotification({
        type: "success",
        message: "Просмотр успешно пройден",
      });
    } catch (error) {
      console.log(error);
      ElNotification.error(appDriverInspectionError.value?.message);
    }
  } else {
    ElNotification({
      type: "error",
      message: "Произошла ошибка",
    });
  }
};

fetchAppDriverVehicleInfo();

console.log(route.hash?.split("/"));
</script>

<template>
  <div class="relative flex-1 flex flex-col p-4 bg-white">
    <section class="flex items-center gap-2">
      <el-icon size="20" color="#409EFF" @click="goToPrevPart">
        <ArrowLeft />
      </el-icon>
      <h2 class="flex-1 text-lg font-medium text-center">{{ partTitle }}</h2>
    </section>

    <component
      :is="partComponent"
      v-model="inspectionPartsData[activePart]"
      @on-next="goToNextPart"
      @on-create="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowRight,
  DocumentChecked,
  DocumentDelete,
  Document,
} from "@element-plus/icons-vue";
import {
  InspectionSignatureStatusType,
  type IInspections,
  type VehicleInspectionDoc,
} from "@/types/inspections";
import { useAppDriverInspections } from "@/composables/useAppDriver";

import UiSheet from "@/components/ui/UiSheet.vue";
import AppDriverInspectionDetails from "@/components/appDriver/AppDriverInspectionDetails.vue";

const props = defineProps({
  inspection: {
    type: Object as () => VehicleInspectionDoc,
    required: true,
  },
});

const emit = defineEmits(["sign"]);
const inspectionDetailsRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const {
  signInspection,
  fetchAppDriverInspectionDetails,
  signInspectionLoading,
} = useAppDriverInspections();

const selectedInspection = ref<IInspections>();
const status = ref<InspectionSignatureStatusType>(
  InspectionSignatureStatusType.Required
);

const handleSign = async (sign: boolean) => {
  const newStatus = sign
    ? InspectionSignatureStatusType.Signed
    : InspectionSignatureStatusType.Rejected;
  await signInspection(props.inspection.id, newStatus);
  status.value = newStatus;
  emit("sign", newStatus);
};

const handleFetchInspectionDetails = async () => {
  try {
    const inspectionDetails = await fetchAppDriverInspectionDetails({
      vehicle_inspection_id: props.inspection.id,
    });
    if (inspectionDetails) {
      selectedInspection.value = { ...inspectionDetails };
      inspectionDetailsRef.value?.show();
    }
  } catch (error) {
    console.error("Failed to fetch inspection details:", error);
  }
};
</script>

<template>
  <div class="w-full bg-[#F0F2F5] rounded-xl p-5">
    <div
      @click="handleFetchInspectionDetails"
      class="text-[#409EFF] text-sm font-medium flex items-center justify-between mb-4 cursor-pointer"
    >
      <el-icon size="20" color="#409EFF"><Document /></el-icon>
      {{ inspection.name }}
      <el-icon size="20" color="#409EFF"><ArrowRight /></el-icon>
    </div>
    <div v-if="status === InspectionSignatureStatusType.Required" class="flex">
      <el-button
        class="w-full rounded-xl h-12"
        type="primary"
        plain
        size="large"
        @click="handleSign(false)"
        :loading="signInspectionLoading"
      >
        Не подписывать
      </el-button>
      <el-button
        class="w-full rounded-xl h-12"
        type="primary"
        size="large"
        @click="handleSign(true)"
        :loading="signInspectionLoading"
      >
        Подписать
      </el-button>
    </div>
    <div v-if="status === InspectionSignatureStatusType.Rejected">
      <div
        class="bg-white h-12 text-[#F56C6C] text-base border-[#F56C6C] w-full rounded-xl border flex items-center justify-center gap-2"
      >
        <el-icon size="20" color="#F56C6C">
          <DocumentDelete />
        </el-icon>
        Осмотр не подписан
      </div>
    </div>

    <div v-if="status === InspectionSignatureStatusType.Signed">
      <div
        class="bg-white h-12 text-[#67C23A] text-base border-[#67C23A] w-full rounded-xl border flex items-center justify-center gap-2"
      >
        <el-icon size="20" color="#67C23A">
          <DocumentChecked />
        </el-icon>
        Осмотр подписан
      </div>
    </div>

    <UiSheet ref="inspectionDetailsRef">
      <AppDriverInspectionDetails :inspection="selectedInspection!" />
    </UiSheet>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Document } from "@element-plus/icons-vue";
import { ref, watch } from "vue";

import AppDriverDocumentInspectionCard from "@/components/appDriver/AppDriverDocumentInspectionCard.vue";
import type {
  InspectionSignatureStatusType,
  VehicleInspectionDoc,
} from "@/types/inspections";

const props = defineProps({
  inspectionSign: {
    type: Boolean,
    default: false,
  },
  inspectionsToSign: {
    type: Array as () => VehicleInspectionDoc[],
  },
});

const emit = defineEmits(["close"]);

const inspectionStatuses = ref<{
  [key: number]: InspectionSignatureStatusType;
}>({});

const handleSign = (
  inspectionId: number,
  status: InspectionSignatureStatusType
) => {
  inspectionStatuses.value[inspectionId] = status;
};

const allInspectionsProcessed = ref(false);

watch(
  inspectionStatuses,
  (newStatuses) => {
    if (props.inspectionsToSign) {
      allInspectionsProcessed.value = props.inspectionsToSign.every(
        (inspection) => newStatuses[inspection.id] !== undefined
      );
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex flex-col gap-6 flex-1 pt-12">
      <el-tag class="w-fit mx-auto" type="warning">Требуется подписание</el-tag>
      <h2 class="text-xl text-center font-medium">Документы для вас</h2>
      <p class="text-[var(--text-color-regular)] text-center">
        Чтобы продолжить работу, необходимо ознакомиться и подписать все
        документы
      </p>
      <div v-if="inspectionSign" class="flex flex-col gap-2">
        <AppDriverDocumentInspectionCard
          v-for="inspection in inspectionsToSign"
          :inspection="inspection"
          :key="inspection.id"
          @sign="(status) => handleSign(inspection.id, status)"
        />
      </div>
      <div v-else class="flex flex-col gap-1">
        <div
          class="flex items-center py-3 px-5 gap-2 bg-[var(--fill-color)] rounded-xl text-[#409EFF]"
          v-for="_ in ['Договор аренды', 'Оферта', 'Договор рассрочки']"
        >
          <el-icon size="20" color="#409EFF"><Document /></el-icon>
          <p class="flex-1">{{ _ }}</p>
          <el-icon size="20" color="#409EFF"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    <el-button
      v-if="allInspectionsProcessed"
      class="h-12 w-full rounded-xl text-base"
      type="primary"
      size="large"
      @click="emit('close')"
    >
      Завершить
    </el-button>
  </div>
</template>

<style scoped></style>

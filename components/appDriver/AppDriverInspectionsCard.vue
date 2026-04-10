<script setup lang="ts">
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import { useInspections } from "@/composables/useInspections";
import { formatDayTime } from "@/helpers/format.helpers";
import { InspectionSignatureStatusType } from "@/types/inspections";

defineProps<{
  inspection: any;
}>();

const { getInspectionTypeLabel, getInspectionSignatureStatusLabel2 } =
  useInspections();
const { getCarBrandById, getCarModelById } = useReferenceBooksStore();

const statusColorClass = (status: string) => {
  return {
    "text-[#67C23A]": status === InspectionSignatureStatusType.Signed,
    "text-[#F56C6C]": status === InspectionSignatureStatusType.Rejected,
  };
};
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-0.5 justify-between py-4 px-5"
  >
    <div class="w-full flex items-center justify-between">
      <p class="font-medium">
        {{
          `${getCarBrandById(inspection?.vehicle?.brand_id)} ${getCarModelById(inspection?.vehicle?.car_model_id)}`
        }}
        {{ inspection.vehicle.plate_number }}
      </p>
      <p
        class="font-medium"
        :class="statusColorClass(inspection.signing_status)"
      >
        {{ getInspectionSignatureStatusLabel2(inspection.signing_status) }}
      </p>
    </div>
    <div class="w-full flex items-center justify-between">
      <p class="text-[var(--text-color-disabled)]">
        {{ formatDayTime(inspection.created_at, true) }}
      </p>
      <p class="text-[#909399]">
        {{ getInspectionTypeLabel(inspection.inspection_type) }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>

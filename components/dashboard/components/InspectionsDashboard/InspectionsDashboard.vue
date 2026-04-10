<script setup lang="ts">
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const { fetchInspectionsDashboardLoading, InspectionsDashboard } =
  storeToRefs(useDashboardStore());
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
const { fetchInspectionsDashboard } = useDashboardStore();

const selected = ref(" ");
const options = {
  " ": "Все ТО",
  true: "Просроченные ТО",
  false: "Действующие ТО",
};

watch(
  selected,
  (v) => {
    if (v !== " ") {
      fetchInspectionsDashboard({
        company_id: currentCompanyId.value,
        to_overdue: v,
      });
    } else {
      fetchInspectionsDashboard({
        company_id: currentCompanyId.value,
      });
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="w-[350px] rounded-[24px] bg-[#fff] flex flex-col">
    <div
      class="flex items-center justify-between gap-2 px-6 py-3 border-b border-[#EBEEF5]"
    >
      <span class="text-[14px] font-medium">Техобслуживание</span>
      <el-select v-model="selected" placeholder="не выбран" clearable class="">
        <el-option
          v-for="(label, value) in options"
          :key="value"
          :label="label"
          :value="value"
        />
      </el-select>
    </div>
    <div
      class="pl-6 pr-[4px] py-[14px] flex flex-col flex-grow"
      v-loading="fetchInspectionsDashboardLoading"
    >
      <ul
        class="custom-scroll flex-col flex gap-3 items-baseline overflow-y-auto max-h-[205px]"
      >
        <li
          v-for="car in InspectionsDashboard"
          :key="car.vehicle_id"
          class="flex flex-col gap-1"
        >
          <div class="text-[14px] font-medium flex gap-2 items-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.96529 0.702148C10.7548 0.772677 11.4111 1.36265 11.5551 2.15527L12.0887 5.09115H12.1036L12.2853 5.09993C13.1817 5.19083 13.8817 5.94812 13.882 6.86849V9.62923L13.8771 9.72005C13.8345 10.1384 13.5016 10.4707 13.0831 10.513L12.9923 10.5179H12.652V12.4038L12.6471 12.4946C12.6049 12.913 12.2725 13.2459 11.8542 13.2885L11.7634 13.2934H10.2585L10.1677 13.2885C9.74924 13.246 9.41699 12.9131 9.37469 12.4946L9.3698 12.4038V10.5179H4.63011V12.4038L4.62523 12.4946C4.58294 12.913 4.25061 13.2459 3.83226 13.2885L3.74144 13.2934H2.23656L2.14574 13.2885C1.72732 13.246 1.39507 12.9131 1.35277 12.4946L1.34789 12.4038V10.5179H1.00696L0.916138 10.513C0.497944 10.4705 0.165736 10.1382 0.123169 9.72005L0.118286 9.62923V6.86849C0.118505 5.9483 0.817801 5.19108 1.71399 5.09993L1.89563 5.09115H1.91126L2.44478 2.15527C2.58883 1.36264 3.24508 0.772656 4.03463 0.702148L4.19381 0.695312H9.80611L9.96529 0.702148ZM4.19381 1.69043C3.81588 1.6905 3.49195 1.96119 3.42428 2.33301L2.92623 5.07227H11.0737L10.5756 2.33301C10.508 1.9612 10.184 1.69052 9.80611 1.69043H4.19381ZM12.8859 6.86849C12.8856 6.43668 12.5355 6.08626 12.1036 6.08626H1.89563C1.46396 6.0865 1.11364 6.43682 1.1134 6.86849V9.52279H12.8859V6.86849ZM11.6559 12.2973H10.3649V10.5307H11.6559V12.2973ZM2.343 12.2973H3.63402V10.5307H2.343V12.2973ZM3.09556 8.39422C3.43238 8.39422 3.70543 8.12117 3.70543 7.78435C3.70543 7.44753 3.43238 7.17448 3.09556 7.17448C2.75874 7.17448 2.48569 7.44753 2.48569 7.78435C2.48569 8.12117 2.75874 8.39422 3.09556 8.39422ZM11.514 7.78435C11.514 8.12117 11.241 8.39422 10.9042 8.39422C10.5673 8.39422 10.2943 8.12117 10.2943 7.78435C10.2943 7.44753 10.5673 7.17448 10.9042 7.17448C11.241 7.17448 11.514 7.44753 11.514 7.78435ZM8.65485 7.31912L8.55524 7.30838H5.44489C5.16998 7.30838 4.94685 7.53151 4.94685 7.80642C4.94685 8.08134 5.16998 8.30447 5.44489 8.30447H8.55524L8.65485 8.29373C8.88181 8.24741 9.05231 8.04706 9.05231 7.80642C9.05231 7.56578 8.88181 7.36544 8.65485 7.31912Z"
                fill="#303133"
              />
            </svg>
            <p class="font-medium">
              {{ car.name }}
              <span class="font-medium" v-if="car.plate_number"
                >,{{ car.plate_number }}</span
              >
            </p>
          </div>
          <p
            class="text-xs"
            :class="{
              'text-[#909399]': car.next_technical_inspection_in > 500,
              'text-[#FF8D14]':
                car.next_technical_inspection_in <= 500 &&
                car.next_technical_inspection_in >= 0,
              'text-red-500': car.next_technical_inspection_in < 0,
            }"
          >
            ТО{{ car.next_technical_inspection_ordinal }}
            <span v-if="car.next_technical_inspection_in >= 0"
              >через {{ car.next_technical_inspection_in }} км</span
            ><span v-else>просрочено</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #fff;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}
</style>

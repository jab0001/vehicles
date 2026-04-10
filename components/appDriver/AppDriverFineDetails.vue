<script setup lang="ts">
import { computed, ref } from "vue";

import { useFines } from "@/composables/useFines";
import type { IFine } from "@/types/fines";
import {
  formatCurrency,
  formatDayTime,
  formatDay,
} from "@/helpers/format.helpers";
import { getVehicleFullname } from "@/helpers/fullname.helpers";

import AppDriverBaseDesc from "./AppDriverBaseDesc.vue";

const props = defineProps<{
  fine: IFine;
}>();

const { getFineLocalStatus } = useFines();
const dialogVisible = ref(false);
const dialogImageUrl = ref("");

const handlePictureCardPreview = (imgUrl: string) => {
  dialogImageUrl.value =
    "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100";
  dialogVisible.value = true;
};
const getTagType = computed(() => {
  if (["paid", "paid_with_discount"].includes(props.fine.local_status))
    return "success";
  if (["not_paid", "not_paid_with_discount"].includes(props.fine.local_status))
    return "warning";
  return "info";
});
</script>

<template>
  <div class="flex flex-col gap-6 px-4">
    <el-tag class="w-fit" :type="getTagType">{{
      getFineLocalStatus(fine?.local_status)
    }}</el-tag>

    <div class="flex flex-col gap-0.5">
      <p class="flex items-center gap-1.5 text-xl font-medium">
        <span
          v-if="fine.discount_price"
          class="text-[var(--text-color-disabled)] line-through"
          >{{ formatCurrency(fine.price) }}</span
        >
        <span>{{
          formatCurrency(fine.discount_price ? fine.discount_price : fine.price)
        }}</span>
      </p>
      <p
        v-if="fine.discount_expires_at"
        class="text-[var(--text-color-regular)] text-xs leading-5"
      >
        Скидка до {{ formatDay(fine.discount_expires_at) }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-x-2 gap-y-6">
      <AppDriverBaseDesc label="№ постановления" :text="fine?.number" />
      <AppDriverBaseDesc
        label="Дата штрафа"
        :text="formatDayTime(fine.issued_date)"
      />
      <AppDriverBaseDesc
        label="Дата постановления"
        :text="formatDay(fine.bill_date)"
      />
      <!-- <AppDriverBaseDesc label="Дата ввода" text="25.12.2025 09:31" /> -->
      <AppDriverBaseDesc
        label="Гос. номер"
        :text="fine.vehicle?.plate_number"
      />
      <AppDriverBaseDesc
        label="Марка и модель"
        :text="
          getVehicleFullname(
            fine.vehicle?.brand?.brand!,
            fine.vehicle?.car_model?.car_model!
          )
        "
      />
    </div>

    <AppDriverBaseDesc label="Примечание" :text="fine.extra.note" />

    <!-- TODO documents -->
    <!-- <AppDriverBaseDesc label="Фотофиксация нарушения" class="-mr-4">
      <div
        class="flex items-center gap-3 pr-4 overflow-x-auto scroll-smooth no-scrollbar"
      >
        <img
          v-for="slide in 5"
          :key="slide"
          src="@/assets/images/car.png"
          class="shrink-0 w-[78px] h-16 object-cover rounded"
          @click="handlePictureCardPreview(slide.toString())"
        />
      </div>
    </AppDriverBaseDesc> -->

    <Teleport to="html">
      <el-dialog width="100%" v-model="dialogVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
    </Teleport>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import {
  ArrowRight,
  CaretTop,
  CaretBottom,
  Refresh,
} from "@element-plus/icons-vue";
import { computed } from "vue";
import { useUser } from "@/composables/useUser";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { formatWithoutCurrency } from "@/helpers/format.helpers";
import { getUserFullname } from "@/helpers/fullname.helpers";
import type { IDriver } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";

const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

const emit = defineEmits<{
  (e: "refresh"): void;
}>();
const props = defineProps<{
  driver: IDriver | undefined;
  vehicle: IVehicle | undefined;
}>();

const isReplenishment = computed(() => {
  return Number(props.driver?.balance_full) >= 0;
});
</script>

<template>
  <div
    class="relative w-full bg-white shadow-app-driver rounded-[20px] flex flex-col gap-3 pt-4 px-2 pb-2"
  >
    <div
      class="absolute -top-2.5 right-[22px] px-2 rounded-full text-xs leading-5 text-white"
      :class="{
        'bg-[var(--text-color-error)]': !vehicle?.is_on_line,
        'bg-[var(--text-color-success)]': vehicle?.is_on_line,
      }"
    >
      {{ !vehicle?.is_on_line ? "снят с линии" : "на линии" }}
    </div>

    <div class="flex items-center gap-2.5 px-3">
      <div class="shrink-0">
        <img
          src="@/assets/images/car.png"
          class="w-[34px] h-[34px] rounded-xl"
          alt=""
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <p class="text-[var(--text-color-secondary)] text-xs leading-5">
          {{ `№${driver?.id}` }}
        </p>
        <div class="text-[13px] leading-5 font-medium truncate">
          {{
            getUserFullname(
              driver?.lastname,
              driver?.firstname,
              driver?.middlename
            )
          }}
        </div>
      </div>
    </div>

    <div
      class="flex flex-col gap-6 bg-[var(--border-color-light)] rounded-[14px] p-[14px]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-start gap-1">
          <p class="font-semibold text-4xl leading-9 tracking-tighter">
            {{ formatWithoutCurrency(driver?.balance) }}
          </p>
          <p class="font-semibold text-lg leading-6">
            {{ userProfileLocalCurrencySymbol }}
          </p>
        </div>

        <el-icon size="12"><ArrowRight /></el-icon>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-end">
          <span class="text-xs">Баланс</span>
          <el-icon v-if="!isReplenishment" size="16" color="#F56C6C"
            ><CaretBottom
          /></el-icon>
          <el-icon v-else size="16" color="#67C23A"><CaretTop /></el-icon>
          <span class="text-xs">{{
            !isReplenishment ? "есть задолженности" : "задолженностей нет"
          }}</span>
        </div>

        <div class="flex items-center gap-1" @click.stop="emit('refresh')">
          <el-icon size="16"><Refresh /></el-icon>
          <span class="text-xs">22:01</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboardStore";
import { User, Phone } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { formatCurrency } from "@/helpers/format.helpers";

import { computed } from "vue";
import { useUserStore } from "@/stores/userStore";

const { DriverDebtDashboard, fetchDriverDebtDashboardLoading } =
  storeToRefs(useDashboardStore());
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

const driversList = computed(() => {
  return (DriverDebtDashboard.value?.drivers ?? []).filter((driver) => {
    const balance = Number(driver.balance_today);
    return balance < 0;
  });
});

const statistics = computed(() => {
  if (!DriverDebtDashboard.value?.drivers.length) {
    return {
      today: 0,
      yesterday: 0,
      accrual: 0
    };
  }

  const today = DriverDebtDashboard.value?.drivers.reduce(
    (acc, item) => acc + Number(item.balance_today),
    0
  );
  const yesterday = DriverDebtDashboard.value?.drivers.reduce(
    (acc, item) => acc + Number(item.balance),
    0
  );
  const today_payed = DriverDebtDashboard.value?.drivers.reduce(
    (acc, item) => acc + Number(item.payed_today),
    0
  );
  const accrual = DriverDebtDashboard.value?.drivers.reduce(
    (acc, item) => acc + Number(item.accrual_today),
    0
  );

  return {
    today,
    yesterday,
    today_payed,
    accrual,
    isUp: today < yesterday
  };
});

const formatPhoneNumber = (phone: string) => {
  return phone.replace(
    /^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/,
    "+$1 ($2) $3-$4-$5"
  );
};
</script>

<template>
  <div class="flex pl-6 pr-[4px]" v-loading="fetchDriverDebtDashboardLoading">
    <ul
      class="custom-scroll flex-col flex gap-3 items-baseline overflow-y-auto max-h-[215px] py-[14px] w-[400px]"
    >
      <li
        v-for="debt in driversList"
        :key="debt.driver_id"
        class="flex flex-col w-full gap-1"
      >
        <div class="text-[14px] font-medium flex gap-2 items-center">
          <el-icon><User /></el-icon>
          <p
            class="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {{
              getUserFullname(debt?.lastname, debt?.firstname, debt?.middlename)
            }}
          </p>
        </div>
        <ul class="flex items-center gap-4 pr-2">
          <li
            class="text-xs py-[2px] px-[10px] bg-[#FEF0F0] rounded-[3px] border border-[#FDE2E2]"
          >
            <p class="text-[#F56C6C]">
              {{ formatCurrency(Number(debt.balance_today) * -1) }}
            </p>
          </li>
          <li class="flex items-center gap-1 text-xs text-[#909399] border-l border-[#dcdfe6] pl-2">
            <el-icon><Phone /></el-icon><p>{{ formatPhoneNumber(debt.phone) }}</p>
          </li>
        </ul>
      </li>
    </ul>
    <div class="w-[160px] border-l border-[#EBEEF5]">
      <div class="flex flex-col items-center px-4 py-3 gap-5">
        <ul class="flex flex-col gap-[2px]">
          <li
            class="py-[10px] px-3 bg-[#F2F3F5] flex flex-col justify-center rounded-tl-[12px] rounded-tr-[12px]"
          >
            <p class="text-xs font-medium text-[#909399]">Сумма итого</p>
            <p class="font-bold whitespace-nowrap">
              {{ formatCurrency(statistics.today * -1) }}
              <span
                class="text-[12px] text-red-500 leading-none"
                v-if="statistics.isUp"
                >&#9650;</span
              >
              <span class="text-[12px] text-green-500 leading-none" v-else
                >&#9660;</span
              >
            </p>
          </li>
          <li
            class="py-[10px] px-3  bg-[#F2F3F5] flex flex-col justify-center"
          >
            <p class="text-xs font-medium text-[#909399]">Начислений за сегодня</p>
            <p class="font-bold">{{ formatCurrency(statistics.accrual * -1) }}</p>
          </li>
          <li
            class="py-[10px] px-3 bg-[#F2F3F5] flex flex-col justify-center rounded-bl-[12px] rounded-br-[12px]"
          >
            <p class="text-xs font-medium text-[#909399]">Погашен за сегодня</p>
            <p class="font-bold">
              {{ statistics.today_payed }} {{ userProfileLocalCurrencySymbol }}
            </p>
          </li>
        </ul>
      </div>
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

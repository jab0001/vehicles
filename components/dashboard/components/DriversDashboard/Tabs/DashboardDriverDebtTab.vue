<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboardStore";
import { User, Phone } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { formatCurrency } from "@/helpers/format.helpers";

import { computed, ref } from "vue";

const { DriverDebtDashboard, fetchDriverDebtDashboardLoading } =
  storeToRefs(useDashboardStore());

const driversList = computed(() => {
  return (DriverDebtDashboard.value?.drivers ?? []).filter((driver) => {
    const balance = Number(driver.balance_today);
    return balance < 0;
  });
});

const formatBalance = (balance: string, balance_today: string) => {
  const difference = Number(balance) + Number(balance_today) * -1;

  return difference <= 0
    ? formatCurrency(difference)
    : `+${formatCurrency(difference)}`;
};

const formatPhoneNumber = (phone: string) => {
  return phone.replace(
    /^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/,
    "+$1 ($2) $3-$4-$5"
  );
};
</script>

<template>
  <ul
    class="custom-scroll flex-col flex flex-grow gap-3 items-baseline overflow-y-auto max-h-[215px] pl-6 pr-[4px] py-[14px]"
    v-loading="fetchDriverDebtDashboardLoading"
  >
    <li
      v-for="debt in driversList"
      :key="debt.driver_id"
      class="flex flex-col w-full gap-1"
    >
      <div class="text-[14px] font-medium flex gap-2 items-center">
        <el-icon><User /></el-icon>
        <p class="font-medium">
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
        <li class="flex flex-col gap-1 text-xs text-[#909399]">
          <p>{{ formatBalance(debt.balance, debt.balance_today) }}</p>
        </li>
        <li class="flex items-center gap-1 text-xs text-[#909399] border-l border-[#dcdfe6] pl-2">
          <el-icon><Phone /></el-icon>
          <p>{{ formatPhoneNumber(debt.phone) }}</p>
        </li>
        <!-- <li class="flex flex-col gap-1 text-xs text-[#909399]">
          <p>Просрочено на 1 день</p>
        </li> -->
      </ul>
    </li>
  </ul>
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

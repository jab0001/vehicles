<script setup lang="ts">
import { User } from "@element-plus/icons-vue";

import { ref } from "vue";

const driversDebt = [
  {
    name: "Христорождественский Григориановичевский Константинопольский",
    sum: "5000",
    sumAdd: "12000",
    today: "Просрочено на 999 дней",
  },
];
</script>

<template>
  <div class="flex pl-6 pr-[4px]">
    <ul
      class="custom-scroll flex-col flex gap-3 items-baseline overflow-y-auto max-h-[215px] py-[14px] w-[400px]"
    >
      <li
        v-for="debt in driversDebt"
        :key="debt.name"
        class="flex flex-col w-full gap-1"
      >
        <div class="text-[14px] font-medium flex gap-2 items-center">
          <el-icon><User /></el-icon>
          <p class="font-medium  whitespace-nowrap overflow-hidden text-ellipsis">
            {{ debt.name }}
          </p>
        </div>
        <ul class="flex items-center gap-4 pr-2">
          <li
            class="text-xs py-[2px] px-[10px] bg-[#FEF0F0] rounded-[3px] border border-[#FDE2E2]"
          >
            <p class="text-[#F56C6C]"><!-- {{ debt.sum }} -->11 415 000,77 ₽</p>
          </li>
          <li class="flex flex-col gap-1 text-xs text-[#909399]">
            <p><!-- {{ debt.sumAdd }} -->Просрочено: 10 025 000 ₽</p>
          </li>
        </ul>
      </li>
    </ul>
    <div class="w-[160px] border-l border-[#EBEEF5]">
      <div class="flex flex-col items-center px-4 py-3 gap-5">
        <ul class="flex flex-col gap-[2px]">
          <li
            class="py-[10px] px-3  bg-[#F2F3F5] flex flex-col justify-center rounded-tl-[12px] rounded-tr-[12px]"
          >
            <p class="text-xs font-medium text-[#909399]">Сумма итого</p>
            <p class="font-bold">146 981 ₽</p>
          </li>
          <li
            class="py-[10px] px-3  bg-[#F2F3F5] flex flex-col justify-center"
          >
            <p class="text-xs font-medium text-[#909399]">Ущерб за сегодня</p>
            <p class="font-bold">146 981 ₽</p>
          </li>
          <li
            class="py-[10px] px-3  bg-[#F2F3F5] flex flex-col justify-center rounded-bl-[12px] rounded-br-[12px]"
          >
            <p class="text-xs font-medium text-[#909399]">Погашен за сегодня</p>
            <p class="font-bold">146 981 ₽</p>
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

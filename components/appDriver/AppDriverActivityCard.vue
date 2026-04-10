<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowRight,
  View,
  Postcard,
  Sort,
  Document,
  Calendar,
} from "@element-plus/icons-vue";
type TActivityType = "damage" | "inspection" | "fine" | "document" | "daysOff";
const props = defineProps<{
  type: TActivityType;
  data?: any;
}>();

const cardTitle = computed(() => {
  if (props.type === "damage") return "Ущербы";
  if (props.type === "fine") return "Штрафы";
  if (props.type === "document") return "Документы";
  if (props.type === "daysOff") return "График работы";
  if (props.type === "inspection") return "Осмотры";
  return "Осмотры";
});
const emptyCardStat = computed(() => {
  if (props.type === "damage") return "Ущербов нет";
  if (props.type === "fine") return "Штрафов нет";
  if (props.type === "document") return "Новых нет";
  if (props.type === "daysOff") return "Выходные не выбраны";
  if (props.type === "inspection") return "Осмотров не было";
  return "Осмотров не было";
});
</script>

<template>
  <div
    class="w-full bg-white shadow-app-driver rounded-[20px] flex flex-col gap-2 py-4 px-3"
  >
    <div class="flex items-center justify-between">
      <div
        class="flex items-center justify-center rounded-full p-2"
        :class="{
          'bg-[#E5FFDE]': type === 'inspection',
          'bg-[#FFE9E8]': type === 'fine',
          'bg-[#FFEFDE]': type === 'damage',
          'bg-[#F2DEFF]': type === 'document',
          'bg-[#ECF5FF]': type === 'daysOff',
        }"
      >
        <el-icon v-if="type === 'inspection'" size="21" color="#6BA15D"
          ><View
        /></el-icon>
        <el-icon v-if="type === 'fine'" size="21" color="#D16A65"
          ><Postcard
        /></el-icon>
        <el-icon v-if="type === 'damage'" size="21" color="#C0782C"
          ><Sort
        /></el-icon>
        <el-icon v-if="type === 'document'" size="21" color="#995DA1"
          ><Document
        /></el-icon>
        <el-icon v-if="type === 'daysOff'" size="21" color="#337ECC"
          ><Calendar
        /></el-icon>
      </div>
      <el-icon size="12"><ArrowRight /></el-icon>
    </div>
    <div>
      <!-- TODO color styles -->
      <p class="font-medium">{{ cardTitle }}</p>
      <p
        v-if="type !== 'document'"
        class="text-xs leading-5"
        :class="[
          ['Открытый ущерб', 'Требуется оплата'].includes(data)
            ? 'text-[var(--text-color-warning)]'
            : 'text-[var(--text-color-secondary)]',
        ]"
      >
        {{ data || emptyCardStat }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>

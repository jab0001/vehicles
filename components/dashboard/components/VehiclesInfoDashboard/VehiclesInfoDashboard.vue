<script setup lang="ts">
import { storeToRefs } from "pinia";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

import { useDowntimeStore } from "@/stores/downtimeStore";
import { useHelpers } from "@/composables/useHelpers";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const { downtimeStatuses } = storeToRefs(useDowntimeStore());
const {
  fetchDowntimeStatuses,
  fetchDowntimeStatusesLoading,
  fetchDowntimeStatusesError,
} = useDowntimeStore();
const { stringToColor } = useHelpers();
const { currentCompaniesIdsList } = storeToRefs(useCompaniesManagementStore());

const listRef = ref<HTMLElement | null>(null);

const isScrollable = ref(false);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const updateArrows = () => {
  const el = listRef.value;
  if (!el) return;

  const tolerance = 2;

  isScrollable.value = el.scrollWidth > el.clientWidth;
  isAtStart.value = el.scrollLeft <= tolerance;
  isAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - tolerance;
};

const onScroll = () => updateArrows();
const onResize = () => updateArrows();

onMounted(async () => {
  fetchDowntimeStatuses({ company_ids: currentCompaniesIdsList.value });
  await nextTick();
  updateArrows();
  listRef.value?.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
});

watch(
  downtimeStatuses,
  async () => {
    await nextTick();
    updateArrows();
  },
  { deep: true }
);

onUnmounted(() => {
  listRef.value?.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
});

const scrollList = (direction: "left" | "right") => {
  const el = listRef.value;
  if (!el) return;
  const amount = direction === "left" ? -200 : 200;
  el.scrollBy({ left: amount, behavior: "smooth" });
};
</script>

<template>
  <div
    class="relative w-full rounded-[24px] bg-white"
    
    v-loading="fetchDowntimeStatusesLoading || fetchDowntimeStatusesError"
  >
    <div class="flex items-center px-5 py-4 gap-10">
      <span class="text-[14px] font-medium"> Автомобили в простое </span>

      <el-button
        v-show="isScrollable && !isAtStart"
        class="!rounded-full !p-1 !h-7 !w-7"
        circle
        text
        @click="scrollList('left')"
      >
        <el-icon class="text-[#a562ff] text-[20px]"><ArrowLeft /></el-icon>
      </el-button>

      <ul
        ref="listRef"
        class="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar w-full"
      >
        <li
          v-for="item in downtimeStatuses"
          :key="item.status"
          class="flex flex-col items-center justify-center gap-1 shrink-0 min-w-[60px]"
          :style="{ color: stringToColor(item.status).text }"
        >
          <p class="text-[20px] font-medium">{{ item.count }}</p>
          <p class="text-[14px] font-medium">{{ item.status }}</p>
        </li>
      </ul>

      <el-button
        v-show="isScrollable && !isAtEnd"
        class="!rounded-full !p-1 !h-7 !w-7"
        circle
        text
        @click="scrollList('right')"
      >
        <el-icon class="text-[#a562ff] text-[20px]"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

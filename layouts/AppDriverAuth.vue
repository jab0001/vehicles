<script setup lang="ts">
import { useAppDriverDriver } from "@/composables/useAppDriver";
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { appDriverInfo, fetchAppDriverInfo } = useAppDriverDriver();
fetchAppDriverInfo();

watch(appDriverInfo, () => {
  if (appDriverInfo.value?.id) {
    router.push(`/app-driver/main/dashboard`);
  }
});
</script>

<template>
  <div class="h-screen bg-[var(--border-color-light)]">
    <div
      class="w-full h-full max-w-[393px] flex flex-col items-center mx-auto px-4 py-8"
    >
      <div class="w-full flex-1 flex flex-col items-center justify-center">
        <div class="mb-6">
          <img src="@/assets/images/app-driver-logo.png" alt="" />
        </div>
        <RouterView />
      </div>

      <p class="w-fit text-[#409EFF] text-base font-medium">
        Написать в техподдержку
      </p>
    </div>
  </div>
</template>

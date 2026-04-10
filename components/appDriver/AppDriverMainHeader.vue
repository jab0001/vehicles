<script setup lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";

defineProps<{
  title: string;
}>();
const router = useRouter();
const route = useRoute();

const goBack = () => {
  if (route.name === "AppDriverBalanceOperations") {
    return router.push({ name: "AppDriverBalance" });
  }
  return router.push({ name: "AppDriverDashboard" });
};
</script>

<template>
  <div class="flex items-center">
    <div class="flex items-center gap-2">
      <el-icon size="20" color="#409EFF" @click="goBack"><ArrowLeft /></el-icon>
      <h2 class="text-lg font-medium">{{ title }}</h2>
    </div>
    <slot />
  </div>
</template>

<style scoped></style>

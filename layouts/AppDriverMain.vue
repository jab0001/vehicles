<script setup lang="ts">
import { onMounted } from "vue";
import { useReferenceBooksStore } from "@/stores/referenceBooks";

const { fetchCarBrands, fetchCarModels } = useReferenceBooksStore();

onMounted(() => {
  fetchCarBrands();
  fetchCarModels();
});
</script>

<template>
  <div class="bg-[var(--border-color-light)]">
    <div class="flex flex-col min-h-screen max-w-[393px] mx-auto">
      <RouterView />
    </div>
  </div>
</template>

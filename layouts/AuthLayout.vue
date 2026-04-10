<script setup lang="ts">
import UiLangThemeSwitch from "@/components/ui/UiLangThemeSwitch.vue";
</script>

<template>
  <div
    class="h-screen flex flex-col bg-repeat p-4"
  >
    <!-- <UiLangThemeSwitch
      class="w-fit bg-white/30 dark:bg-black/30 flex items-center rounded-2xl ml-auto gap-4 p-2 backdrop-blur-sm"
    /> -->

    <div class="flex-1 flex justify-center items-center">
      <RouterView />
    </div>
  </div>
</template>

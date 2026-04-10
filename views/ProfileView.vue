<script setup lang="ts">
import { useMounted } from "@vueuse/core";

import ProfileMain from "@/components/profile/ProfileMain.vue";


const isMounted = useMounted();
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex max-w-[656px] w-full mx-auto">
      <div class="text-nowrap text-[24px] font-medium">
        Профиль
      </div>
    </div>
  </Teleport>

  <ProfileMain class="max-w-[656px] w-full mx-auto"/>
</template>

<style scoped>
</style>

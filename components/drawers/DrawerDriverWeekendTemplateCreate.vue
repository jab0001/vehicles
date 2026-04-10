<script setup lang="ts">
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsDriversInfoWeekendTempalte from "@/components/forms/FormsDriversInfoWeekendTempalte.vue";

import { useAppStore } from "@/stores/appStore";

const { hideDrawer } = useAppStore();
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium">Добавить шаблон настройки выходных</h1>
    <FormsDriversInfoWeekendTempalte class="mt-4">
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary">Создать</el-button>
        </div>
      </template>
    </FormsDriversInfoWeekendTempalte>
  </UiDrawerWrapper>
</template>

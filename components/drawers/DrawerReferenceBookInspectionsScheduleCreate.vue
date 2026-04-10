<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookInspectionsSchedule from "@/components/forms/FormReferenceBookInspectionsSchedule.vue";
import { useInspectionsScheduleStore } from "@/stores/inspectionsScheduleStore";

const { hideDrawer } = useAppStore();
const { createInspectionsSchedule } = useInspectionsScheduleStore();
const { createInspectionsScheduleLoading } = storeToRefs(useInspectionsScheduleStore());
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-5">Новый шаблон прохождения ТО</h1>
    <FormReferenceBookInspectionsSchedule v-loading="createInspectionsScheduleLoading">
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="createInspectionsSchedule"
            >Создать</el-button
          >
        </div>
      </template>
    </FormReferenceBookInspectionsSchedule>
  </UiDrawerWrapper>
</template>
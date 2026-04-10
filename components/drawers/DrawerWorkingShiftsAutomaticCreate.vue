<script setup lang="ts">
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import WorkingShiftsCreateAutomaticForm from "@/components/workingShifts/WorkingShiftsCreateAutomaticForm.vue";
import WorkingShiftsNoticeOverrideModal from "@/components/workingShifts/WorkingShiftsNoticeOverride.vue";
import { useWorkingShiftsStore } from "@/stores/workingShiftStore";
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from "pinia";

const { createWorkingShiftsAutomatic, resetCreateWorkingShiftsAutomaticForm } =
  useWorkingShiftsStore();
const { noticeAutomaticModal } = storeToRefs(useWorkingShiftsStore());
const { hideDrawer } = useAppStore();

const createWorkingShifts = () => {
  createWorkingShiftsAutomatic();
};

const closeWorkingAutomatic = () => {
  resetCreateWorkingShiftsAutomaticForm();
  hideDrawer();
};

const closeNoticeModal = () => {
  noticeAutomaticModal.value = false;
  closeWorkingAutomatic();
};
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Автоматическое распределение смен</h1>

    <WorkingShiftsCreateAutomaticForm>
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="closeWorkingAutomatic">Отмена</el-button>
          <el-button type="primary" @click="createWorkingShifts"
            >Добавить</el-button
          >
        </div>
      </template>
    </WorkingShiftsCreateAutomaticForm>

    <WorkingShiftsNoticeOverrideModal
      v-if="noticeAutomaticModal"
      :modal-visible="noticeAutomaticModal"
      @close-modal="closeNoticeModal"
      @createWorkingShifts="createWorkingShifts"
    />
  </UiDrawerWrapper>
</template>

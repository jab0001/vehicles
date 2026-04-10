<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import { useReasonChangingStatusStore } from "@/stores/reasonChangingStatusStore";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookDismissal from "@/components/forms/FormReferenceBookDismissal.vue";

const { hideDrawer } = useAppStore();
const { createStatusReason } = useReasonChangingStatusStore();
const { createReasonChangingStatusLoading } = storeToRefs(
  useReasonChangingStatusStore()
);
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-5">Новая причина увольнения</h1>

    <FormReferenceBookDismissal>
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button
            type="primary"
            @click="createStatusReason"
            :loading="createReasonChangingStatusLoading"
            >Создать</el-button
          >
        </div>
      </template>
    </FormReferenceBookDismissal>
  </UiDrawerWrapper>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/appStore";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookUser from "../forms/FormReferenceBookUser.vue";
import { useRoute } from "vue-router";
import { ref } from "vue";

const { hideDrawer } = useAppStore();
const route = useRoute();
const userId = route.hash?.split("/")[2];
const formRef = ref<InstanceType<typeof FormReferenceBookUser> | null>(null);

const handleSubmit = async () => {
  if (formRef.value) {
    await formRef.value.submitForm();
  }
};
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-5">Редактирование пользователя</h1>
    <FormReferenceBookUser ref="formRef" :user-id="userId">
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="handleSubmit">Сохранить</el-button>
        </div>
      </template>
    </FormReferenceBookUser>
  </UiDrawerWrapper>
</template>

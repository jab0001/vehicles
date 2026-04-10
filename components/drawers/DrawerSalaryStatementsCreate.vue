<script setup lang="ts">
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import SalaryStatementCreateForm from "@/components/salaryStatements/SalaryStatementsCreateForm.vue";
import salaryStatementsChooseDriverModal from "@/components/salaryStatements/SalaryStatementsDriverChooseModal.vue";
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from "pinia";
import { useSalaryStatementsStore } from "@/stores/salaryStatementsStore";
import { ref } from "vue";

const { createSalaryStatements, resetCreateSalaryStatementsForm } =
  useSalaryStatementsStore();
const { chooseDriversModal } = storeToRefs(useSalaryStatementsStore());
const { hideDrawer } = useAppStore();

const isSubmitting = ref(false);

const createSalaryStatement = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await createSalaryStatements();
    hideDrawer();
  } finally {
    isSubmitting.value = false;
  }
};

const closeSalaryStatement = () => {
  resetCreateSalaryStatementsForm();
  hideDrawer();
};

const closeChooseDriversModal = () => {
  chooseDriversModal.value = false;
};
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Сформировать ведомость</h1>

    <SalaryStatementCreateForm>
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="closeSalaryStatement">Отмена</el-button>
          <el-button type="primary" @click="createSalaryStatement" :loading="isSubmitting"
            >Сформировать</el-button
          >
        </div>
      </template>
    </SalaryStatementCreateForm>

    <salaryStatementsChooseDriverModal
      v-if="chooseDriversModal"
      :modal-visible="chooseDriversModal"
      @close-modal="closeChooseDriversModal"
    />
  </UiDrawerWrapper>
</template>

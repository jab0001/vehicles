<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useCashRegistersStore } from "@/stores/cashRegistersStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookCashRegister from "@/components/forms/FormReferenceBookCashRegister.vue";

const { createCashRegister } = useCashRegistersStore();
const { createCashRegisterLoading } = storeToRefs(useCashRegistersStore());
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Добавить кассу</h1>
    <FormReferenceBookCashRegister>
      <template #footer>
        <div class="flex justify-end">
          <el-button
            type="primary"
            @click="createCashRegister"
            :loading="createCashRegisterLoading"
          >
            Создать
          </el-button>
        </div>
      </template>
    </FormReferenceBookCashRegister>
  </UiDrawerWrapper>
</template>

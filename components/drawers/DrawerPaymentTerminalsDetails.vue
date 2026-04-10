<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { useAppStore } from "@/stores/appStore";
import { useFinesStore } from "@/stores/finesStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsPaymentTerminals from "@/components/forms/FormsPaymentTerminals.vue";
import { usePaymentTerminalsStore } from "@/stores/paymentTerminalsStore";

const route = useRoute();
const { hideDrawer } = useAppStore();
const { fetchPaymentTerminalsItem, updatePaymentTerminals } =
  usePaymentTerminalsStore();
const { paymentTerminalsItemLoading, updatePaymentTerminalsLoading } =
  storeToRefs(usePaymentTerminalsStore());

const updateTerminal = () => {
  updatePaymentTerminals(Number(route.hash?.split("/")[2]));
};

fetchPaymentTerminalsItem({
  terminal_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium">Онлайн-эквайринг</h1>

    <FormsPaymentTerminals
      v-loading="paymentTerminalsItemLoading || updatePaymentTerminalsLoading"
      class="mt-4"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="updateTerminal"
            >Сохранить</el-button
          >
        </div>
      </template>
    </FormsPaymentTerminals>
  </UiDrawerWrapper>
</template>

<style scoped></style>

<script setup lang="ts">
import { useMounted } from "@vueuse/core";

import PaymentTerminalCard from "@/components//paymentTerminals/PaymentTerminalCard.vue";
import { storeToRefs } from "pinia";
import { usePaymentTerminalsStore } from "@/stores/paymentTerminalsStore";
import { onMounted } from "vue";
import { useSettings } from "@/composables/useSettings";

const isMounted = useMounted();

const { paymentTerminalsList } = storeToRefs(usePaymentTerminalsStore());
const { fetchSettings, settings } = useSettings();
fetchSettings();

const { fetchPaymentTerminalsListRequest, initialPaymentTerminalsListParams } =
  usePaymentTerminalsStore();

/* const connectTerminal = () => {
  alert("Connect");
}; */

onMounted(() => {
  fetchPaymentTerminalsListRequest({ ...initialPaymentTerminalsListParams });
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[656px] mx-auto flex justify-between">
      <div class="text-md text-nowrap text-lg">
        {{ "Онлайн-эквайринг" }}
      </div>
    </div>
  </Teleport>
  <div
    class="w-full max-w-[656px] mx-auto flex flex-col gap-2.5"
    v-if="paymentTerminalsList.length"
  >
    <PaymentTerminalCard
      v-for="terminal in paymentTerminalsList"
      :terminalData="terminal"
      :operations="settings?.allowed_payment_categories"
    />
  </div>

  <div class="w-full max-w-[656px] mx-auto flex flex-col gap-2.5" v-else>
    <div class="bg-[var(--fill-color-light)] rounded-lg p-4">
      <div class="flex gap-2 items-center mb-3">
        <div class="text-sm font-semibold">Не подключен</div>
      </div>

      <div class="text-[#909399] text-sm mb-3">
        Услуга эквайринга в данный момент не подключена. Для активации
        эквайринга и обеспечения возможности приема платежей в мобильном
        приложении от водителей, пожалуйста, обратитесь в службу поддержки. Наши
        специалисты помогут вам с подключением и предоставят всю необходимую
        информацию для настройки услуги.
      </div>

      <!-- <div>
        <el-button type="primary" @click="connectTerminal"
          >Подключить</el-button
        >
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { onMounted, ref, computed, watch } from "vue";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useAppDriverTKassa } from "@/composables/useAppDriver";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { formatDecimal, formatCurrency } from "@/helpers/format.helpers";
import type { ITkassaInitParams, ITkassaPayment } from "@/types/tkassa";
import type { TBalanceOperationsCategory } from "@/types/balanceOperations";
import { useUser } from "@/composables/useUser";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();

const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const { getBalanceOperationCategory } = useBalanceOperations();
const {
  tkassaInitLoading,
  tkassaInitResponse,
  initTkassaPayment,
  paymentSettingsLoading,
  operationOptions,
  fetchPaymentSettings,
  paymentSettingsResponse,

  amountTkassaPayment,
  tkassaAmountResponse,
} = useAppDriverTKassa();

const form = ref<ITkassaInitParams>({
  amount: "",
  operation_category: "" as TBalanceOperationsCategory,
});

const isCommissionInclude = ref(false);

const localPaymentData = computed(() => {
  const paymentData = localStorage.getItem("app_driver.payment");
  return paymentData ? JSON.parse(paymentData) : null;
});

const successPayment = computed(() => {
  return route.hash.split("#").includes("success");
});
const errorPayment = computed(() => {
  return route.hash.split("#").includes("error");
});
const comissionPercent = computed(() => {
  if (successPayment.value) {
    return (
      (localPaymentData.value.commission / localPaymentData.value.amount) * 100
    );
  }

  if (!tkassaInitResponse.value) return 1;
  return (
    (tkassaInitResponse.value.commission / tkassaInitResponse.value.amount) *
    100
  );
});

const handleFormDataChange = async () => {
  if (form.value.amount && form.value.operation_category) {
    try {
      await amountTkassaPayment({
        amount_to_credit: isCommissionInclude.value
          ? null
          : Number(form.value.amount) * 100,
        amount_to_pay: isCommissionInclude.value
          ? Number(form.value.amount) * 100
          : null,
      });
    } catch (error: any) {
      console.log({ error });
      tkassaAmountResponse.value = undefined;
      ElNotification({
        title: "Ошибка",
        message: error?.user_message,
        type: "error",
      });
    }
  }
};

const createPayment = async () => {
  try {
    await initTkassaPayment({
      ...form.value,
      amount: tkassaAmountResponse.value!.credited_amount!,
    });
    redirectToPayment(tkassaInitResponse.value!);
  } catch (error: any) {
    tkassaInitResponse.value = undefined;
    ElNotification({
      title: "Ошибка",
      message: error?.user_message,
      type: "error",
    });
  }
};

const debouncedFn = useDebounceFn((v: any) => {
  handleFormDataChange();
}, 350);

const redirectToPayment = (payment: ITkassaPayment) => {
  localStorage.setItem(
    "app_driver.payment",
    JSON.stringify({
      ...payment,
      ...form.value,
      amount: Number(form.value.amount) * 100,
    })
  );
  window.location.href = payment.payment_url;
};
const goToBalance = () => {
  router.push({ name: "AppDriverBalance" });
  localStorage.removeItem("app_driver.payment");
};

onMounted(() => {
  if (localPaymentData.value && errorPayment.value) {
    form.value = {
      amount: localPaymentData.value.amount,
      operation_category: localPaymentData.value.operation_category,
    };
    tkassaInitResponse.value = {
      payment_id: localPaymentData.value.payment_id,
      order_id: localPaymentData.value.order_id,
      amount: localPaymentData.value.amount,
      commission: localPaymentData.value.commission,
      payment_url: localPaymentData.value.payment_url,
    };
  }
});

fetchPaymentSettings();

watch(isCommissionInclude, () => {
  handleFormDataChange();
});
</script>

<template>
  <div
    v-if="!successPayment"
    class="flex flex-col justify-between p-4 flex-grow"
  >
    <div class="flex flex-col flex-grow">
      <div class="flex items-center gap-2 mb-8">
        <el-icon
          size="20"
          color="#409EFF"
          @click="router.push({ name: 'AppDriverBalance' })"
        >
          <ArrowLeft />
        </el-icon>
        <h2 class="flex-1 text-lg font-medium text-center">
          Пополнение баланса
        </h2>
        <el-icon size="20">
          <!-- empty icon for center h2 -->
        </el-icon>
      </div>
      <img
        class="mb-8 h-24 w-56 mx-auto"
        src="@/assets/images/app-driver-balance-add-img.png"
        alt=""
      />
      <el-form
        class="flex flex-col gap-2"
        label-position="top"
        ref="formRef"
        label-width="auto"
      >
        <el-form-item label="Статья пополнения" prop="category">
          <el-select
            v-model="form.operation_category"
            @change="handleFormDataChange"
            placeholder="Не выбран"
          >
            <el-option
              v-for="item in operationOptions"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Сумма пополнения" prop="mount">
          <el-input
            class="h-14 rounded-xl"
            size="large"
            v-model="form.amount"
            :formatter="(value: string) => formatDecimal(value)"
            placeholder="Введите сумму"
            @input="debouncedFn"
          >
            <template #suffix>{{ userProfileLocalCurrencySymbol }}</template>
          </el-input>
          <div
            v-if="tkassaAmountResponse"
            class="w-fit text-sm text-[#909399] mt-1.5"
          >
            Комиссия
            {{
              Math.round(
                parseFloat(tkassaAmountResponse.commission_percentage)
              )
            }}%, но не менее
            {{ Math.round(parseFloat(tkassaAmountResponse.min_commission)) }}
            {{ userProfileLocalCurrencySymbol }}
          </div>
        </el-form-item>
      </el-form>
      <el-checkbox
        v-model="isCommissionInclude"
        class="ml-6 mb-8"
        size="large"
        label="Включить комиссию в стоимость"
      />

      <div
        v-if="tkassaInitLoading || tkassaAmountResponse"
        class="flex flex-col items-center justify-center h-32"
      >
        <div
          v-if="tkassaInitLoading && !tkassaAmountResponse"
          v-loading="tkassaInitLoading"
        ></div>
        <div
          class="flex flex-col gap-[1px] w-full text-base font-medium"
          v-if="tkassaAmountResponse"
          v-loading="paymentSettingsLoading"
        >
          <div class="bg-white flex justify-between px-4 py-3 rounded-t-xl">
            <div>С карты спишется</div>
            <div class="flex gap-1">
              {{ formatCurrency(tkassaAmountResponse.payable_amount / 100) }}
            </div>
          </div>
          <div class="bg-white flex justify-between px-4 py-3">
            <div>
              {{
                `Комиссия ${Math.round(
                  parseFloat(tkassaAmountResponse.commission_percentage)
                )}%`
              }}
            </div>
            <div class="flex gap-1">
              {{ formatCurrency(tkassaAmountResponse?.commission / 100) }}
            </div>
          </div>
          <div class="bg-white flex justify-between px-4 py-3 rounded-b-xl">
            <div>На счет поступит</div>
            <div class="flex gap-1">
              {{ formatCurrency(tkassaAmountResponse.credited_amount / 100) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col mt-16">
      <div
        v-if="errorPayment"
        class="text-center text-[#F56C6C] font-medium mb-6"
      >
        Оплата не прошла, может не хватает денег<br />
        на карте, может что-то еще
      </div>
      <el-button
        v-if="!tkassaAmountResponse"
        disabled
        class="h-14 rounded-xl text-base w-full"
        size="large"
        plain
        type="info"
        >Укажите статью и сумму</el-button
      >
      <el-button
        v-else
        class="h-14 rounded-xl text-base w-full"
        size="large"
        type="primary"
        :loading="paymentSettingsLoading"
        @click="createPayment"
        >Оплатить
        {{
          formatCurrency(tkassaAmountResponse?.payable_amount / 100)
        }}</el-button
      >
    </div>
  </div>

  <div v-else class="flex items-center justify-center flex-grow">
    <div class="rounded-[35px] p-6 bg-white">
      <img
        class="mb-7 h-24 w-56 mx-auto"
        src="@/assets/images/app-driver-balance-add-success.png"
        alt=""
      />
      <div class="text-lg font-medium mb-7 text-center">
        Баланс успешно пополнен!
      </div>
      <div class="mb-4">
        <div
          class="flex justify-between gap-2 border-t border-t-[#DCDFE6] py-2.5"
        >
          <div>Статья пополнения</div>
          <div>
            {{
              getBalanceOperationCategory(localPaymentData?.operation_category)
            }}
          </div>
        </div>
        <div class="flex justify-between border-t border-t-[#DCDFE6] py-2.5">
          <div>С карты списалось</div>
          <div>{{ formatCurrency(localPaymentData?.amount / 100) }}</div>
        </div>
        <div class="flex justify-between border-t border-t-[#DCDFE6] py-2.5">
          <div>{{ `Комиссия ${comissionPercent}%` }}</div>
          <div>{{ formatCurrency(localPaymentData?.commission / 100) }}</div>
        </div>
        <div class="flex justify-between border-t border-t-[#DCDFE6] py-2.5">
          <div>На счет поступило</div>
          <div>
            {{
              formatCurrency(
                (localPaymentData?.amount - localPaymentData?.commission) / 100
              )
            }}
          </div>
        </div>
      </div>
      <el-button
        class="h-14 rounded-xl text-base w-full bg-[#F0F2F5] text-[#409EFF] border-transparent"
        size="large"
        type="primary"
        @click="goToBalance"
        >Готово</el-button
      >
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__inner) {
  text-align: start !important;
}
:deep(.el-input__wrapper) {
  border-radius: 12px;
}
:deep(.el-select__wrapper) {
  height: 56px;
  border-radius: 12px;
}
:deep(.el-checkbox__inner) {
  height: 24px !important;
  width: 24px !important;
}
:deep(.el-checkbox__label) {
  font-size: 16px;
  color: #606266;
}
</style>

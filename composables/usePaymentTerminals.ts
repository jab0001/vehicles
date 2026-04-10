import { computed, reactive, ref, watch } from "vue";

import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";

import useApi from "@/composables/useApi";
import * as t from "@/types/paymentTerminals";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";

export const usePaymentTerminals = () => {
  const {
    loading: paymentTerminalstListLoading,
    response: paymentTerminalsResponse,
    request: fetchPaymentTerminalsListRequest,
  } = useApi<t.IPaymentTerminals[], t.IPaymentTerminalsListParams>({
    url: "/api/v1/payment_terminals",
    method: "GET",
  });
  const {
    loading: paymentTerminalsItemLoading,
    response: paymentTerminalsItemResponse,
    request: fetchPaymentTerminalsItem,
  } = useApi<t.IPaymentTerminals, { terminal_id: number }>({
    dynamicUrl: (p) => `/api/v1/payment_terminals/${p.terminal_id}`,
    method: "GET",
  });
  const {
    response: updatedPaymentTerminals,
    loading: updatePaymentTerminalsLoading,
    error: updatePaymentTerminalsError,
    request: updatePaymentTerminalsRequest,
  } = useApi<t.IPaymentTerminalsCreateForm, { terminal_id: number }>({
    dynamicUrl: (p) => `/api/v1/payment_terminals/${p.terminal_id}`,
    method: "PUT",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const paymentTerminalsList = computed<t.IPaymentTerminals[]>(() => {
    return paymentTerminalsResponse.value ?? [];
  });

  const initialPaymentTerminalsListParams: t.IPaymentTerminalsListParams = {
    active: true,
  };

  const paymentTerminalsRef = ref<FormInstance>();
  const paymentTerminalsFormDefault: t.IPaymentTerminalsCreateForm = {
    id: undefined,
    terminal_key: undefined,
    provider: undefined,
    vat: null,
    is_active: false,
    cash_register_id: 0,
    min_commission: "",
    commission_percentage: "",
  };

  const paymentTerminalsForm = ref<t.IPaymentTerminalsCreateForm>({
    ...paymentTerminalsFormDefault,
  });

  const clearForm = () => {
    paymentTerminalsForm.value = { ...paymentTerminalsFormDefault };
  };

  const paymentTerminalsRules = reactive<FormRules>({
    provider: [
      {
        required: true,
        message: "Введите наименование",
        trigger: "blur",
      },
    ],
    min_commission: [
      {
        required: true,
        message: "Введите комиссию",
        trigger: "blur",
      },
    ],
    commission_percentage: [
      {
        required: true,
        message: "Введите комиссию",
        trigger: "blur",
      },
    ],
  });

  watch(paymentTerminalsItemResponse, (v) => {
    if (v) {
      clearForm();
      paymentTerminalsForm.value = {
        ...v,
      };
    }
  });

  const updatePaymentTerminals = async (terminal_id: number): Promise<void> => {
    validatePromise(paymentTerminalsRef.value!).then(async () => {
      try {
        await updatePaymentTerminalsRequest({
          terminal_id,
          ...paymentTerminalsForm.value
        });
        await fetchPaymentTerminalsListRequest({
          ...initialPaymentTerminalsListParams,
        });

        hideDrawer();

        ElNotification({
          title: "Успешный запрос",
          message: "Касса успешно обновлена",
          type: "success",
        });
      } catch (e) {
        console.error({ e });
        ElNotification({
          title: updatePaymentTerminalsError.value?.title ?? "Ошибка",
          message:
            updatePaymentTerminalsError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  return {
    initialPaymentTerminalsListParams,
    fetchPaymentTerminalsListRequest,
    paymentTerminalsList,
    paymentTerminalstListLoading,
    paymentTerminalsResponse,

    paymentTerminalsForm,
    paymentTerminalsRules,
    paymentTerminalsRef,

    updatePaymentTerminals,
    updatePaymentTerminalsLoading,

    fetchPaymentTerminalsItem,
    paymentTerminalsItemLoading,

    updatePaymentTerminalsRequest,

    clearForm,
  };
};

import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, reactive, watch } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/cashRegisters";

export const useCashRegisters = () => {
  const {
    loading: cashRegistersListLoading,
    response: cashRegisters,
    request: fetchCashRegistersList,
  } = useApi<t.ICashRegister[]>({
    url: "/api/v1/cash_registers",
    method: "GET",
  });
  const {
    loading: cashRegisterDetailsLoading,
    response: cashRegisterDetailsResult,
    request: fetchCashRegisterDetails,
  } = useApi<t.ICashRegister, t.ICashRegisterDetailParams>({
    dynamicUrl: (p) => `/api/v1/cash_registers/${p.cash_register_id}`,
    method: "GET",
  });
  const {
    loading: createCashRegisterLoading,
    error: createCashRegisterError,
    response: newCashRegister,
    request: createCashRegisterRequest,
  } = useApi<t.ICashRegister, t.ICashRegisterForm>({
    url: "/api/v1/cash_registers",
    method: "POST",
  });
  const {
    loading: editCashRegisterLoading,
    error: editCashRegisterError,
    response: editCashRegisterResult,
    request: editCashRegisterRequest,
  } = useApi<t.ICashRegister, t.ICashRegisterEditParams>({
    dynamicUrl: (p) =>
      `/api/v1/cash_registers?cash_register_id=${p.cash_register_id}`,
    method: "PATCH",
  });
  const {
    loading: deletecashRegisterLoading,
    error: deleteCashRegisterError,
    response: deleteCashRegisterResult,
    request: deleteCashRegisterRequest,
  } = useApi<string, t.ICashRegisterDetailParams>({
    dynamicUrl: (p) => `/api/v1/cash_registers/${p.cash_register_id}`,
    method: "DELETE",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const emptyCashRegisterForm: t.ICashRegisterForm = {
    name: "",
    transactions_type: t.ECashRegisterTransactionsType.Cash,
  };
  const cashRegisterRef = ref<FormInstance>();
  const cashRegisterRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование",
        trigger: "blur",
      },
    ],
  });
  const cashRegisterForm = ref({ ...emptyCashRegisterForm });

  watch(cashRegisterDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.ICashRegisterForm)[];
      keys.forEach((key) => {
        if (key in cashRegisterForm.value) {
          // @ts-ignore
          cashRegisterForm.value[key] = v[key];
        }
      });
    }
  });

  const createCashRegister = async () => {
    validatePromise(cashRegisterRef.value!).then(async () => {
      try {
        await createCashRegisterRequest({
          ...cashRegisterForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Касса добавлена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createCashRegisterError.value?.title ?? "Ошибка",
          message:
            createCashRegisterError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const editCashRegister = async () => {
    validatePromise(cashRegisterRef.value!).then(async () => {
      try {
        await editCashRegisterRequest({
          ...cashRegisterForm.value,
          cash_register_id: cashRegisterDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Касса измененa",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editCashRegisterError.value?.title ?? "Ошибка",
          message:
            editCashRegisterError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteCashRegister = async (id: number): Promise<void> => {
    try {
      await deleteCashRegisterRequest({
        cash_register_id: id,
      });
      await fetchCashRegistersList();
      ElNotification({
        title: "Успешный запрос",
        message: "Касса удалена",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteCashRegisterError.value?.title ?? "Ошибка",
        message:
          deleteCashRegisterError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const clearForm = () => {
    cashRegisterForm.value = { ...emptyCashRegisterForm };
  };

  return {
    cashRegisterRef,
    cashRegisterRules,
    cashRegisterForm,

    cashRegistersListLoading,
    cashRegisters,
    fetchCashRegistersList,

    cashRegisterDetailsLoading,
    cashRegisterDetailsResult,
    fetchCashRegisterDetails,

    createCashRegisterLoading,
    newCashRegister,
    createCashRegister,

    editCashRegisterLoading,
    editCashRegisterResult,
    editCashRegister,

    deletecashRegisterLoading,
    deleteCashRegisterResult,
    deleteCashRegister,

    clearForm,
  };
};

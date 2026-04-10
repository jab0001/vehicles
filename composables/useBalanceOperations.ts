import { computed, reactive, ref, watch } from "vue";
import {
  ElNotification,
  dayjs,
  type FormInstance,
  type FormRules,
} from "element-plus";

import useApi from "@/composables/useApi";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";
import { formatDayTime } from "@/helpers/format.helpers";

import type { IPagination } from "@/types/apiDefault";
import * as t from "@/types/balanceOperations";
import * as crt from "@/types/cashRegisters";
import { useFiles } from "./useFiles";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

interface IOptionsOperationCategories {
  label: string;
  key: t.TBalanceOperationsCategory;
}

export const useBalanceOperations = () => {
  const {
    response: cashRegistersResponse,
    loading: cashRegistersLoading,
    request: fetchCashRegisters,
  } = useApi<crt.ICashRegister[]>({
    url: "/api/v1/cash_registers",
    method: "GET",
  });
  const { request: createCashRegister } = useApi<
    crt.ICashRegister,
    Omit<crt.ICashRegister, "id">
  >({
    url: "/api/v1/cash_registers",
    method: "POST",
  });
  const {
    response: operationsResponse,
    loading: operationsListLoading,
    request: fetchBalanceOperations,
  } = useApi<
    IPagination<t.IBalanceOperationDetails>,
    t.IBalanceOperationListParams
  >({
    url: "/api/v1/balance-operations",
    method: "GET",
  });
  const {
    response: operationsFullTableResponse,
    loading: operationsFullTableListLoading,
    request: fetchBalanceFullTableOperations,
  } = useApi<
    IPagination<t.IBalanceOperationDetails>,
    t.IBalanceOperationListParams
  >({
    url: "/api/v1/balance-operations",
    method: "GET",
  });
  const {
    loading: operationDetailLoading,
    response: operationDetailResult,
    request: fetchOperationDetail,
  } = useApi<t.IBalanceOperationDetails, t.IBalanceOperationDetailsParams>({
    dynamicUrl: (p) => `/api/v1/balance-operations/${p.operation_id}`,
    method: "GET",
  });
  const {
    loading: createOperationLoading,
    error: createOperationError,
    response: newOperation,
    request: createOperationRequest,
  } = useApi<t.IBalanceOperationDetails, t.IBalanceOperationForm>({
    url: "/api/v1/balance-operations",
    method: "POST",
  });
  const {
    loading: createTransferLoading,
    error: createTransferError,
    response: crateTransferResponse,
    request: createTransferRequest,
  } = useApi<string, t.IBalanceOperationTransferForm>({
    url: "/api/v1/balance-operations/transfer",
    method: "POST",
  });
  const {
    response: updateOperationResponse,
    loading: updateOperationLoading,
    request: updateOperationRequest,
    error: updateOperationError,
  } = useApi<t.IBalanceOperationDetails, t.IBalanceOperationEditParams>({
    method: "PATCH",
    dynamicUrl: (p) => `/api/v1/balance-operations/${p.operation_id}`,
  });

  const initialOperationsParams: t.IBalanceOperationListParams = {
    limit: 20,
    page: 1,
    driver_id: undefined,
    date_from: null,
    date_to: null,
    user_id: undefined,
    operation_category: undefined,
    operation_type: undefined,
    order_by: undefined,
    direction: undefined,
    
  };
  const emptyOperationForm: t.IBalanceOperationForm = {
    vehicle_id: undefined,
    driver_id: undefined,
    operation_type: "accrual",
    amount_type: "" as t.TBalanceOperationsAmountType,
    operation_category: "" as t.TBalanceOperationsCategory,
    amount: "",
    user_description: "",
    origin_type: null,
    origin_id: null,
    parent_operation_id: null,
    cash_register_id: null,
    category_from: undefined,
    category_to: undefined,
  };

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const { downloadFile } = useFiles();

  const balanceOperationRef = ref<FormInstance>();
  const defaultBalanceOperationRules = {
    driver_id: [
      {
        required: true,
        message: "Выберите водителя",
        trigger: "change",
      },
    ],
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    cash_register_id: [
      {
        required: true,
        message: "Выберите кассу",
        trigger: "change",
      },
    ],
    operation_type: [
      { required: true, message: "Выберите вид операции", trigger: "change" },
    ],
    operation_category: [
      { required: true, message: "Выберите тип операции", trigger: "change" },
    ],
    amount: [{ required: true, message: "Введите cуммy", trigger: "blur" }],
  };
  const balanceOperationRules = ref<FormRules>({
    ...defaultBalanceOperationRules,
  });
  const operationForm = ref({
    ...emptyOperationForm,
  });

  const cashRegisters = computed<crt.ICashRegister[]>(
    () => cashRegistersResponse.value ?? []
  );
  const operations = computed(() => {
    return operationsResponse.value?.items ?? [];
  });
  const operationsFullTable = computed(() => {
    return operationsFullTableResponse.value?.items ?? [];
  });
  const operationsTotalItems = computed(
    () => operationsResponse.value?.total_items ?? 0
  );
  const operationsFullTableTotalItems = computed(
    () => operationsFullTableResponse.value?.total_items ?? 0
  );
  const operationCantBeEdit = computed(() => {
    if (!operationDetailResult.value) return false;
    // return (
    //   dayjs().diff(operationDetailResult.value.created_at, "hour", true) > 24
    // );
    return true;
  });
  const operationAmount = computed(() => {
    return operationForm.value.amount_type == "positive"
      ? Number(operationForm.value.amount)
      : -Number(operationForm.value.amount);
  });

  watch(operationDetailResult, (v) => {
    if (v) {
      clear();
      operationForm.value = {
        ...v,
        amount_type: Number(v.amount) < 0 ? "negative" : "positive",
      };
    }
  });

  const clear = () => {
    operationForm.value = { ...emptyOperationForm };
  };

  const createNewOperation = () => {
    if (operationForm.value.operation_category === "transfer") {
      createTransferOperation();
    } else {
      createOperation();
    }
  };

  const createTransferOperation = async (): Promise<void> => {
    try {
      await createTransferRequest({
        driver_id: operationForm.value.driver_id!,
        amount: operationForm.value.amount,
        category_from: operationForm.value.category_from!,
        category_to: operationForm.value.category_to!,
      });
      hideDrawer();
      ElNotification({
        title: "Успешный запрос",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createTransferError.value?.title ?? "Ошибка",
        message:
          createTransferError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const createOperation = async (): Promise<void> => {
    // больше 24ч - amount = -(текущий amount - новый amount)
    validatePromise(balanceOperationRef.value!).then(async () => {
      try {
        await createOperationRequest({
          ...operationForm.value,
          amount: !operationCantBeEdit.value
            ? operationAmount.value
            : -(
                Number(operationDetailResult.value?.amount!) -
                operationAmount.value
              ),
          driver_id: operationForm.value.driver_id!,
          parent_operation_id: operationDetailResult.value?.id ?? null,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: !operationCantBeEdit.value
            ? "Операция добавлена"
            : "Операция изменена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createOperationError.value?.title ?? "Ошибка",
          message:
            createOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteOperation = async (): Promise<void> => {
    // удалить - создать новую (-amount + parent_operation_id)
    validatePromise(balanceOperationRef.value!).then(async () => {
      try {
        await createOperationRequest({
          ...operationForm.value,
          amount: -Number(operationForm.value.amount),
          parent_operation_id: operationDetailResult.value?.id,
          driver_id: operationForm.value.driver_id!,
          user_description: `${operationForm.value.user_description} (УДАЛЕНИЕ)`,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция удалена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createOperationError.value?.title ?? "Ошибка",
          message:
            createOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateOperation = async (): Promise<void> => {
    // меньше 24ч - патч и все
    validatePromise(balanceOperationRef.value!).then(async () => {
      try {
        await updateOperationRequest({
          user_description: operationForm.value.user_description,
          amount:
            operationForm.value.amount_type == "positive"
              ? Number(operationForm.value.amount)
              : -Number(operationForm.value.amount),
          operation_id: operationDetailResult.value?.id!,
          cash_register_id:
            operationDetailResult.value?.cash_register_id ?? null,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция изменена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createOperationError.value?.title ?? "Ошибка",
          message:
            createOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const getBalanceOperationType = (status: t.TBalanceOperationsType) => {
    switch (status) {
      case "accrual":
        return "Начисление";
      case "cash_register":
        return "Кассовая операция";
      default:
        break;
    }
  };
  const categoriesList = ref<t.TBalanceOperationsCategory[]>([
    "damage",
    "deposit",
    "fine",
    "franchise",
    "other",
    "redemption",
    "rent",
    "repayment_damage",
    "repayment_deposit",
    "repayment_franchise",
    "toll_road",
    "unallocated_funds",
  ]);
  const getBalanceOperationCategory = (
    status: t.TBalanceOperationsCategory
  ) => {
    switch (status) {
      case "deposit":
        return "Депозит";
      case "franchise":
        return "Франшиза";
      case "rent":
        return "Аренда";
      case "fine":
        return "Штраф ГИБДД";
      case "damage":
        return "Ущерб";
      case "toll_road":
        return "Платные дороги";
      case "repayment_damage":
        return "Долг по ущербам";
      case "repayment_franchise":
        return "Долг по франшизе";
      case "redemption":
        return "Выкуп";
      case "repayment_deposit":
        return "Долг за депозит";
      case "unallocated_funds":
        return "Внутренний баланс";
      case "transfer":
        return "Перевод между статьями";
      case "other":
        return "Прочее";
      default:
        return "";
    }
  };
  const getOperationShortName = (v: t.IBalanceOperationDetails) => {
    return `${v.id} (${getBalanceOperationCategory(v.operation_category)}) от ${formatDayTime(v.created_at)}`;
  };

  const getCashRegisters = () => {
    if (!cashRegistersResponse.value) {
      fetchCashRegisters();
    }
  };

  const optionsOperationCategories: IOptionsOperationCategories[] = [
    {
      label: getBalanceOperationCategory("deposit"),
      key: "deposit",
    },
    {
      label: getBalanceOperationCategory("franchise"),
      key: "franchise",
    },
    {
      label: getBalanceOperationCategory("rent"),
      key: "rent",
    },
    {
      label: getBalanceOperationCategory("redemption"),
      key: "redemption",
    },
    {
      label: getBalanceOperationCategory("fine"),
      key: "fine",
    },
    {
      label: getBalanceOperationCategory("damage"),
      key: "damage",
    },
    {
      label: getBalanceOperationCategory("toll_road"),
      key: "toll_road",
    },
    {
      label: getBalanceOperationCategory("repayment_damage"),
      key: "repayment_damage",
    },
    {
      label: getBalanceOperationCategory("repayment_franchise"),
      key: "repayment_franchise",
    },
    {
      label: getBalanceOperationCategory("repayment_deposit"),
      key: "repayment_deposit",
    },
    {
      label: getBalanceOperationCategory("unallocated_funds"),
      key: "unallocated_funds",
    },
    {
      label: getBalanceOperationCategory("transfer"),
      key: "transfer",
    },
    {
      label: getBalanceOperationCategory("other"),
      key: "other",
    },
  ];

  const downloadDriverPayments = async (data: {
  search: string | undefined;
  date_from: string | null;
  date_to: string | null;
  operation_category: t.TBalanceOperationsCategory | undefined;
  operation_type: t.TBalanceOperationsType | undefined;
  page: number;
  order_by: string;
  direction: "ascending" | "descending"
}, driver_id: number): Promise<void> => {
    const {search, date_from, date_to, operation_category, operation_type, order_by, direction} = data;
      try {
        const params = new URLSearchParams();
        
        params.append("driver_id", String(driver_id))
       if (search) params.append("search", String(search));
       if (date_from) params.append("date_from", String(date_from));
       if (date_to) params.append("date_to", String(date_to));
       if (operation_category) params.append("operation_category", String(operation_category));
       if (operation_type) params.append("operation_type", String(operation_type));
       if (direction) params.append("direction", String(direction));
       if (order_by) params.append("order_by", String(order_by));
        
  
        const result = await axios.get(
          `${MAIN_ENDPOINT}api/v1/balance-operations/report`,
          {
            params,
            responseType: "blob",
          }
        );
  
        downloadFile({
          // @ts-ignore
          id: "_",
          name: `driver_operations_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
          blob: result.data,
        });
  
        ElNotification({
          title: "Успешный запрос",
          message: "Список операций получен",
          type: "success",
        });
      } catch (e: any) {
        if (e.response && e.response.status === 400) {
          const errorBlob = e.response.data;
          const errorText = await errorBlob.text();
  
          const errorJson = JSON.parse(errorText);
          const userMessage = errorJson.user_message || "Произошла ошибка";
  
          ElNotification({
            title: "Ошибка",
            message: userMessage,
            type: "error",
          });
        } else {
          ElNotification({
            title: "Ошибка",
            message: e.message || "Произошла ошибка, обратитесь к администратору",
            type: "error",
          });
        }
      }
    };

  return {
    operationsResponse,
    operationsListLoading,
    operationsFullTableListLoading,
    fetchBalanceOperations,
    fetchBalanceFullTableOperations,

    operationDetailResult,
    operationDetailLoading,
    fetchOperationDetail,

    createOperationLoading,
    createOperationError,
    newOperation,
    createOperation,
    createNewOperation,
    deleteOperation,

    createTransferRequest,

    updateOperationResponse,
    updateOperationLoading,
    updateOperationError,
    updateOperation,

    cashRegisters,
    fetchCashRegisters,
    getCashRegisters,

    initialOperationsParams,
    operationsTotalItems,
    operationsFullTableTotalItems,
    operations,
    operationsFullTable,
    operationCantBeEdit,

    balanceOperationRef,
    operationForm,
    balanceOperationRules,

    clear,
    getBalanceOperationType,
    getBalanceOperationCategory,
    getOperationShortName,

    categoriesList,
    optionsOperationCategories,

    defaultBalanceOperationRules,

    downloadDriverPayments
  };
};

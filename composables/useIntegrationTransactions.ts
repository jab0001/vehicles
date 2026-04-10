import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import useApi from "@/composables/useApi";
import type {
  IIntegrationTransaction,
  IIntegrationTransactionsListParams,
} from "@/types/integrations-transactions";
import type { IPagination } from "@/types/apiDefault";

export const useIntegrationTransactions = () => {
  const transactionsFilters = ref<IIntegrationTransactionsListParams>({
    page: 1,
    limit: 20,
  });

  // Получение списка транзакций
  const {
    loading: fetchTransactionsLoading,
    response: transactionsResponse,
    request: fetchTransactionsRequest,
  } = useApi<
    IPagination<IIntegrationTransaction>,
    IIntegrationTransactionsListParams
  >({
    url: "/api/v1/integrations_transaction",
    method: "GET",
  });

  // Получение деталей транзакции
  const {
    loading: transactionDetailsLoading,
    response: transactionDetailsResult,
    request: fetchTransactionDetailsRequest,
  } = useApi<IIntegrationTransaction, { integration_transaction_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/integrations_transaction/${p.integration_transaction_id}`,
    method: "GET",
  });

  // Привязка смены к транзакции

  const {
    loading: bindShiftLoading,
    error: bindShiftError,
    response: bindShiftResult,
    request: bindShiftRequest,
  } = useApi<
    IIntegrationTransaction,
    { integration_transaction_id: number; working_shift_record_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/integrations_transaction/${p.integration_transaction_id}/manual_working_shift`,
    method: "POST",
  });

  // Отвязка смены от транзакции
  const {
    loading: unbindShiftLoading,
    error: unbindShiftError,
    response: unbindShiftResult,
    request: unbindShiftRequest,
  } = useApi<IIntegrationTransaction, { integration_transaction_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/integrations_transaction/${p.integration_transaction_id}/manual_working_shift`,
    method: "DELETE",
  });

  // Вычисляемые свойства
  const transactions = computed(() => {
    return transactionsResponse.value?.items ?? [];
  });

  const transactionsTotalItems = computed(
    () => transactionsResponse.value?.total_items ?? 0,
  );

  const fetchTransactions = async () => {
    try {
      await fetchTransactionsRequest({
        ...transactionsFilters.value,
      });
    } catch (e) {
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка при загрузке транзакций",
        type: "error",
      });
      throw e;
    }
  };

  const fetchTransactionDetails = async (
    integration_transaction_id: number,
  ) => {
    try {
      await fetchTransactionDetailsRequest({
        integration_transaction_id,
      });
    } catch (e) {
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка при загрузке деталей транзакции",
        type: "error",
      });
      throw e;
    }
  };

  const bindShiftToTransaction = async (
    integration_transaction_id: number,
    working_shift_record_id: number,
  ) => {
    try {
      await bindShiftRequest({
        integration_transaction_id,
        working_shift_record_id,
      });

      fetchTransactionDetails(integration_transaction_id);

      ElNotification({
        title: "Успех",
        message: "Смена успешно привязана к транзакции",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка при привязке смены к транзакции",
        type: "error",
      });
      throw e;
    }
  };

  const unbindShiftFromTransaction = async (
    integration_transaction_id: number,
  ) => {
    try {
      await unbindShiftRequest({
        integration_transaction_id,
      });

      fetchTransactionDetails(integration_transaction_id);

      ElNotification({
        title: "Успех",
        message: "Смена успешно отвязана от транзакции",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка при отвязке смены от транзакции",
        type: "error",
      });
      throw e;
    }
  };

  return {
    // Filters
    transactionsFilters,

    // List
    fetchTransactionsLoading,
    transactionsResponse,
    fetchTransactions,
    transactions,
    transactionsTotalItems,

    // Details
    transactionDetailsLoading,
    transactionDetailsResult,
    fetchTransactionDetails,

    // Bind
    bindShiftLoading,
    bindShiftToTransaction,

    // Unbind
    unbindShiftLoading,
    unbindShiftFromTransaction,
  };
};

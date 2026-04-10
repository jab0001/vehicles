import { ref, computed } from "vue";
import useApi from "./useApi";
import type {
  IIntegrationOrder,
  IIntegrationOrdersListParams,
  IIntegrationOrdersListResponse,
} from "@/types/integrations-orders";
import { ElNotification } from "element-plus";

export const useIntegrationOrders = () => {
  const ordersFilters = ref<IIntegrationOrdersListParams>({
    page: 1,
    limit: 20,
  });

  const {
    request: fetchOrders,
    loading: fetchOrdersLoading,
    response: ordersResponse,
    error: fetchOrdersError,
  } = useApi<IIntegrationOrdersListResponse, IIntegrationOrdersListParams>({
    url: "/api/v1/integrations_order",
    method: "GET",
  });

  const {
    loading: orderDetailsLoading,
    response: orderDetailsResult,
    request: fetchOrderDetailsRequest,
  } = useApi<IIntegrationOrder, { integration_order_id: number }>({
    dynamicUrl: (p) => `/api/v1/integrations_order/${p.integration_order_id}`,
    method: "GET",
  });

  // Привязка смены к транзакции

  const {
    loading: bindShiftLoading,
    error: bindShiftError,
    response: bindShiftResult,
    request: bindShiftRequest,
  } = useApi<
    IIntegrationOrder,
    { integration_order_id: number; working_shift_record_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/integrations_order/${p.integration_order_id}/manual_working_shift`,
    method: "POST",
  });

  // Отвязка смены от транзакции
  const {
    loading: unbindShiftLoading,
    error: unbindShiftError,
    response: unbindShiftResult,
    request: unbindShiftRequest,
  } = useApi<IIntegrationOrder, { integration_order_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/integrations_order/${p.integration_order_id}/manual_working_shift`,
    method: "DELETE",
  });

  const fetchOrderDetails = async (integration_order_id: number) => {
    try {
      await fetchOrderDetailsRequest({
        integration_order_id,
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

  const orders = computed(() => ordersResponse.value?.items || []);
  const ordersTotalItems = computed(
    () => ordersResponse.value?.total_items || 0,
  );
  const ordersTotalPages = computed(
    () => ordersResponse.value?.total_pages || 0,
  );
  const ordersCurrentPage = computed(
    () => ordersResponse.value?.current_page || 1,
  );
  const ordersPageItems = computed(() => ordersResponse.value?.page_items || 0);

  const bindShiftToOrder = async (
    integration_order_id: number,
    working_shift_record_id: number,
  ) => {
    try {
      await bindShiftRequest({
        integration_order_id,
        working_shift_record_id,
      });

      fetchOrderDetails(integration_order_id);
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

  const unbindShiftFromOrder = async (
    integration_order_id: number,
  ) => {
    try {
      await unbindShiftRequest({
        integration_order_id,
      });

      fetchOrderDetails(integration_order_id);

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
    orders,
    ordersTotalItems,
    ordersTotalPages,
    ordersCurrentPage,
    ordersPageItems,
    fetchOrdersLoading,
    fetchOrdersError,
    ordersFilters,
    fetchOrders,

    fetchOrderDetails,
    orderDetailsResult,
    orderDetailsLoading,

    bindShiftLoading,
    bindShiftToOrder,
    unbindShiftLoading,
    unbindShiftFromOrder,
  };
};

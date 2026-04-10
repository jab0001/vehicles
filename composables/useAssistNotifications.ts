import { ref, reactive, computed, watch } from "vue";
import useApi from "@/composables/useApi";
import { ElNotification } from "element-plus";

export interface IAssistNotificationItem {
  id?: number;
  condition: number;
}

export interface IAssistNotification {
  user_id: number;
  notification_type:
    | "INSURANCE"
    | "DRIVER_LICENSE"
    | "STS"
    | "VEHICLE_LICENSE"
    | "DIAGNOSTIC_CARD"
    | "DRIVER_PASSPORT"
    | "MEDICAL_CERTIFICATE"
    | "KISARD"
    | "TECHNICAL_INSPECTION"
    | "REPORTS_CARS_IDLE"
    | "REPORTS_DRIVER_DEBT"
    | "REPORTS_CARS_REPAIR"
    | "REPORTS_CARS_ON_LINE"
    | "FINE_NOT_PAID_IN_GIBDD_DISCOUNT_EXPIRATION"
    | "FINE_NOT_PAID_IN_GIBDD_TRANSFER_TO_FBS"
    | "FINE_NOT_PAID_BY_DRIVER_TRANSFER_TO_FBS"
    | "FINE_NOT_PAID_BY_DRIVER_DISCOUNT_EXPIRATION"
    | "TOLL_ROAD_NOT_PAID_TO_OPERATING_COMPANY"
    | "TOLL_ROAD_NOT_PAID_BY_DRIVER";
  enabled: boolean;
  exec_match: boolean;
  channels: string[];
  notification_group: string;
  notify_at_localtime: string;
  notify_at_days: number[];
  items: IAssistNotificationItem[];
}

export const ASSIST_NOTIFICATIONS_DAYS_TYPES = [
  "REPORTS_CARS_IDLE",
  "REPORTS_CARS_REPAIR",
  "REPORTS_CARS_ON_LINE",
  "REPORTS_DRIVER_DEBT",
];
export const ASSIST_NOTIFICATIONS_KM_TYPES = ["TECHNICAL_INSPECTION"];

export interface IAssistNotificationParams {
  notification_group?: string;
  notification_region: "user" | "drivers";
}

export interface IUpdateAssistNotificationParams {
  notification_type: IAssistNotification["notification_type"];
  enabled: IAssistNotification["enabled"];
  notify_at_localtime: IAssistNotification["notify_at_localtime"];
  notification_region: "user" | "drivers";
}

export const useAssistNotifications = () => {
  // Get user notification settings
  const {
    loading: fetchAssistNotificationsLoading,
    response: fetchAssistNotificationsResponse,
    request: fetchAssistNotificationsRequest,
    error: fetchAssistNotificationsError,
  } = useApi<IAssistNotification[], IAssistNotificationParams>({
    dynamicUrl: (p) => `/api/v1/assist_notifications/${p.notification_region}`,
    method: "GET",
  });

  const {
    loading: updateAssistNotificationLoading,
    response: updateAssistNotificationResponse,
    request: updateAssistNotificationRequest,
    error: updateAssistNotificationError,
  } = useApi<IAssistNotification, IUpdateAssistNotificationParams>({
    dynamicUrl: (p) =>
      `/api/v1/assist_notifications/${p.notification_region}/${p.notification_type}`,
    method: "PUT",
  });
  watch(
    [updateAssistNotificationResponse, updateAssistNotificationError],
    ([res, err]) => {
      if (res && !err) {
        ElNotification({
          title: "Успешно",
          message: "Настройки уведомлений успешно изменены",
          type: "success",
        });
      } else if (err) {
        ElNotification({
          title: "Ошибка",
          message: err.message || "Произошла ошибка",
          type: "error",
        });
      }
    }
  );

  const availableFinesAssistNotifications = computed<IAssistNotification[]>(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        [
          "FINE_NOT_PAID_IN_GIBDD_DISCOUNT_EXPIRATION",
          "FINE_NOT_PAID_IN_GIBDD_TRANSFER_TO_FBS",
          "FINE_NOT_PAID_BY_DRIVER_TRANSFER_TO_FBS",
          "FINE_NOT_PAID_BY_DRIVER_DISCOUNT_EXPIRATION",
        ].includes(item.notification_type)
      ) ?? []
  );

  const availableDocumentsAssistNotifications = computed<IAssistNotification[]>(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        [
          "INSURANCE",
          "DRIVER_LICENSE",
          "STS",
          "VEHICLE_LICENSE",
          "DIAGNOSTIC_CARD",
          "DRIVER_PASSPORT",
          "MEDICAL_CERTIFICATE",
          "KISARD",
        ].includes(item.notification_type)
      ) ?? []
  );

  const availableDocumentsDriverAssistNotifications = computed<
    IAssistNotification[]
  >(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        [
          "INSURANCE",
          "DRIVER_LICENSE",
          "DRIVER_PASSPORT",
          "MEDICAL_CERTIFICATE",
        ].includes(item.notification_type)
      ) ?? []
  );

  const availableReportsAssistNotifications = computed<IAssistNotification[]>(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        [
          "REPORTS_CARS_IDLE",
          "REPORTS_CARS_REPAIR",
          "REPORTS_CARS_ON_LINE",
          "REPORTS_DRIVER_DEBT",
        ].includes(item.notification_type)
      ) ?? []
  );

  const availableTollroadAssistNotifications = computed<IAssistNotification[]>(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        [
          "TOLL_ROAD_NOT_PAID_TO_OPERATING_COMPANY",
          "TOLL_ROAD_NOT_PAID_BY_DRIVER",
        ].includes(item.notification_type)
      ) ?? []
  );

  const availableInspectionAssistNotifications = computed<
    IAssistNotification[]
  >(
    () =>
      fetchAssistNotificationsResponse.value?.filter((item) =>
        ["TECHNICAL_INSPECTION"].includes(item.notification_type)
      ) ?? []
  );

  async function fetchAssistNotifications(params: IAssistNotificationParams) {
    return fetchAssistNotificationsRequest(params);
  }

  async function updateAssistNotification(
    params: IUpdateAssistNotificationParams
  ) {
    return updateAssistNotificationRequest(params);
  }

  function getAssistNotificationTypeName(
    type?: IAssistNotification["notification_type"]
  ) {
    switch (type) {
      case "INSURANCE":
        return "Страховка";
      case "DRIVER_LICENSE":
        return "Водительские права";
      case "STS":
        return "СТС";
      case "VEHICLE_LICENSE":
        return "Лицензия";
      case "DIAGNOSTIC_CARD":
        return "Диагностические карты";
      case "DRIVER_PASSPORT":
        return "Паспорт водителя";
      case "MEDICAL_CERTIFICATE":
        return "Медицинская справка";
      case "KISARD":
        return `КИС "АРТ"`;
      case "FINE_NOT_PAID_IN_GIBDD_DISCOUNT_EXPIRATION":
        return "До истечения скидки в ГИБДД";
      case "FINE_NOT_PAID_IN_GIBDD_TRANSFER_TO_FBS":
        return "До передачи в ФССП";
      case "FINE_NOT_PAID_BY_DRIVER_TRANSFER_TO_FBS":
        return "До передачи в ФССП";
      case "FINE_NOT_PAID_BY_DRIVER_DISCOUNT_EXPIRATION":
        return "Скидка истекает";
      case "REPORTS_CARS_ON_LINE":
        return "На линии";
      case "REPORTS_CARS_IDLE":
        return "По простоям";
      case "REPORTS_DRIVER_DEBT":
        return "Задолженности водителей";
      case "REPORTS_CARS_REPAIR":
        return "Ремонты";
      case "TOLL_ROAD_NOT_PAID_TO_OPERATING_COMPANY":
        return "До конца срока оплаты в ЦОДД";
      case "TOLL_ROAD_NOT_PAID_BY_DRIVER":
        return "До конца срока оплаты водителем";
      case "TECHNICAL_INSPECTION":
        return "Техническое обслуживание";
      default:
        return "Неизвестно";
    }
  }

  return {
    fetchAssistNotificationsLoading,
    fetchAssistNotificationsResponse,
    fetchAssistNotificationsError,
    fetchAssistNotifications,

    updateAssistNotificationLoading,
    updateAssistNotificationResponse,
    updateAssistNotificationError,
    updateAssistNotification,

    availableFinesAssistNotifications,
    availableDocumentsAssistNotifications,
    availableDocumentsDriverAssistNotifications,
    availableReportsAssistNotifications,
    availableTollroadAssistNotifications,
    availableInspectionAssistNotifications,
    getAssistNotificationTypeName,
  };
};

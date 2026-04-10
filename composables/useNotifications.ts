import { computed, ref, reactive, watch } from "vue";
import { ElNotification } from "element-plus";
import useApi from "@/composables/useApi";

import { NOTIFICATIONS_ENDPOINT } from "@/api";

import type { IPagination } from "@/types/apiDefault";
import * as t from "@/types/notifications";

export const useNotifications = () => {
  const {
    request: fetchNotificationList,
    response: notificationsResponse,
    loading: notificationsListLoading,
  } = useApi<IPagination<t.INotification>, t.INotificationListParams>({
    baseURL: NOTIFICATIONS_ENDPOINT,
    url: "/api/v1/notification/notify",
    method: "GET",
  });

  const {
    request: readNotificationRequest,
    error: readNotificationError,
    loading: readNotificationsLoading,
  } = useApi<
    {
      response: String;
    },
    t.INotificationReadParams
  >({
    baseURL: NOTIFICATIONS_ENDPOINT,
    url: "/api/v1/notification/notify/read/",
    method: "POST",
  });

  const notificationsList = ref<t.INotification[]>([]);
  const params = reactive({
    page: 1,
    limit: 20,
  });
  const totalPages = computed(() => {
    return notificationsResponse.value?.total_pages ?? 1;
  });

  watch(
    notificationsResponse,
    (v) => {
      if (v?.items) {
        notificationsList.value = [...notificationsList.value, ...v.items];
      }
    },
    { deep: true }
  );

  const loadMoreNotifications = () => {
    if (params.page < totalPages.value) {
      params.page++;
      fetchNotificationList(params);
    }
  };
  const readNotification = async (notice: t.INotification) => {
    try {
      await readNotificationRequest({
        notification_id: notice.id,
      });
      notificationsList.value = notificationsList.value.filter(
        (i) => i.id !== notice.id
      );
    } catch (error) {
      ElNotification({
        title: readNotificationError.value?.title ?? "Ошибка",
        message:
          readNotificationError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  return {
    fetchNotificationList,
    loadMoreNotifications,
    notificationsList,
    totalPages,
    params,
    notificationsListLoading,

    readNotification,
    readNotificationsLoading,
  };
};

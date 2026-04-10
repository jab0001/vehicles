import { computed, ref, watch } from "vue";
import { dayjs, ElNotification } from "element-plus";
import type { IPagination } from "@/types/apiDefault";
import * as t from "@/types/downtime";

import useApi from "@/composables/useApi";

export const useDowntime = () => {
  const {
    loading: fetchDowntimeStatusesLoading,
    error: fetchDowntimeStatusesError,
    response: fetchDowntimeStatusesResponse,
    request: fetchDowntimeStatusesRequest,
  } = useApi<t.IDowntimeStatusesFetchResponse, t.IDowntimeStatusesFetchParams>({
    dynamicUrl: () => `/api/v1/dashboards/vehicle_statuses/count`,
    method: "GET",
  });

  const {
    loading: fetchDowntimeLastRefreshTimeLoading,
    error: fetchDowntimeLastRefreshTimeError,
    response: downtimeLastRefreshTime,
    request: fetchDowntimeLastRefreshTime,
  } = useApi<string>({
    url: `/api/v1/dashboards/vehicle_statuses/last_refresh_time`,
    method: "GET",
  });

  const { request: refreshDowntime } = useApi<string>({
    url: `/api/v1/dashboards/vehicle_statuses/refresh`,
    method: "GET",
  });

  const {
    loading: fetchDowntimeLoading,
    error: fetchDowntimeError,
    response: fetchDowntimeResponse,
    request: fetchDowntimeRequest,
  } = useApi<t.IDowntimeFetchResponse, t.IDowntimeFetchParams>({
    dynamicUrl: (p) =>
      `/api/v1/dashboards/vehicle_statuses/table?page=${p.page}&limit=${p.limit}`,
    method: "POST",
  });

  const {
    loading: fetchAccrualLoading,
    error: fetchAccrualError,
    response: fetchAccrualResult,
    request: fetchAccrual,
  } = useApi<IPagination<t.IDashboardsAccrualDashboardResponse>>({
    url: `/api/v1/dashboards/accrual_dashboard`,
    method: "GET",
  });

  const fetchDowntimeStatuses = async (
    params: t.IDowntimeStatusesFetchParams
  ): Promise<void> => {
    try {
      await fetchDowntimeStatusesRequest({ ...params });
    } catch (e) {
      ElNotification({
        title: fetchDowntimeStatusesError.value?.title ?? "Ошибка",
        message:
          fetchDowntimeStatusesError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const fetchDowntime = async (
    params: t.IDowntimeFetchParams
  ): Promise<void> => {
    try {
      await fetchDowntimeRequest({ ...params });
    } catch (e) {
      ElNotification({
        title: fetchDowntimeError.value?.title ?? "Ошибка",
        message:
          fetchDowntimeError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const downtimeStatuses = computed(() => {
    if (!fetchDowntimeStatusesResponse.value) return [];

    const vehicleStatuses =
      fetchDowntimeStatusesResponse.value.vehicle_statuses;
    if (!vehicleStatuses) return [];

    return Object.keys(vehicleStatuses).map((key) => ({
      status: key,
      count: vehicleStatuses[key],
    }));
  });

  const downtimeStatusesCount = computed<number>(() => {
    return (
      downtimeStatuses.value.reduce((sum, item) => sum + item.count, 0) ?? 0
    );
  });

  const downtimeOnLineCount = computed<number>(() => {

    let onLineItem = downtimeStatuses.value.find(
      (item) => item.status == "На линии"
    );

    return onLineItem?.count ?? 0;
  });

  const downtimeNotOnLineCount = computed<number>(() => {
    return (
      downtimeStatuses.value
        .filter((item) => item.status != "На линии")
        .reduce((sum, item) => sum + item.count, 0) ?? 0
    );
  });

  // const downtimeOnLineCount = computed<number>(() => {
  //   console.log("downtimeOnLineCount1");
  //   let onLineItem = downtimeStatuses.value.find(
  //     (item) => item.status == "На линии"
  //   );
  //   console.log("downtimeOnLineCount2");
  //   return onLineItem?.count ?? 0;
  // });

  // const downtimeNotOnLineCount = computed<number>(() => {
  //   return (
  //     downtimeStatuses.value
  //       .filter((item) => item.status != "На линии")
  //       .reduce((sum, item) => sum + item.count, 0) ?? 0
  //   );
  // });

  const downtimeTableItems = computed(() => {
    if (!fetchDowntimeResponse.value) return [];
    console.log("fetchDowntimeResponse.value.items", fetchDowntimeResponse.value.items);
    return fetchDowntimeResponse.value.items;
  });

  const downtimeTotalItems = computed(
    () => fetchDowntimeResponse.value?.total_items ?? 0
  );

  const accrualItem = computed<
    t.IDashboardsAccrualDashboardResponse | undefined
  >(() => {
    let item = fetchAccrualResult.value?.items[0];
    if (item) {
      // @ts-ignore
      item.period_range = item.period_range.map((dateStr) =>
        dateStr ? dayjs(dateStr).format("YYYY-MM-DD") : null
      );
    }
    return fetchAccrualResult.value?.items[0];
  });

  return {
    fetchDowntimeStatuses,
    fetchDowntime,

    downtimeStatuses,
    downtimeTableItems,
    fetchDowntimeStatusesLoading,
    fetchDowntimeStatusesError,
    downtimeTotalItems,
    fetchDowntimeLoading,

    downtimeStatusesCount,
    downtimeOnLineCount,
    downtimeNotOnLineCount,

    fetchAccrual,
    accrualItem,

    downtimeLastRefreshTime,
    fetchDowntimeLastRefreshTime,

    refreshDowntime,
  };
};

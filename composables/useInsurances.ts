import { computed, ref } from "vue";

import useApi from "@/composables/useApi";

import * as t from "@/types/insurances";
import type { IPagination } from "@/types/apiDefault";

export const useInsurances = () => {
  const {
    loading: insurancesListLoading,
    response: insurancesResponse,
    request: fetchInsurancesList,
  } = useApi<IPagination<t.IInsurance>, t.IInsurancesListParams>({
    url: "/api/v1/vehicles/insurances/all",
    method: "GET",
  });
  const {
    loading: insuranceStatisticsLoading,
    response: insuranceStatisticsResponse,
    request: fetchInsuranceStatistics,
  } = useApi<
    {
      active: number;
      expires_soon: number;
      wo_insurance: number;
    },
    t.IInsurancesStatisticParams
  >({
    url: "/api/v1/vehicles/insurances/all/stats",
    method: "GET",
  });

  const initialInsurancesParams: t.IInsurancesListParams = {
    order_by: "created_at",
    direction: "desc",
    limit: 20,
    page: 1,
    insurance_statuses: [],
    expires_after_days_delta: 0,
    insurance_types: [],
    query: undefined,
  };

  const insuranceDashboardSettings = ref({
    insurance_types_active: ["kasko", "osago", "osgop"],
    insurance_types_expires: ["kasko", "osago", "osgop"],
    cars_without_insurance_types: ["kasko", "osago", "osgop"],
  });

  const insurancesList = computed<t.IInsurance[]>(() => {
    return insurancesResponse.value?.items ?? [];
  });
  const insurancesListTotalItems = computed(
    () => insurancesResponse.value?.total_items ?? 0,
  );

  const getInsuranceType = (v: string | undefined) => {
    if (v === "osgop") return "ОСГОП";
    if (v === "osago") return "ОСАГО";
    if (v === "kasko") return "КАСКО";
    if (v === "passenger") return "Пассажир";
    if (v === "do_osago") return "ДО ОСАГО";
    return "";
  };

  return {
    insurancesList,
    insurancesListTotalItems,
    insurancesListLoading,
    fetchInsurancesList,
    fetchInsuranceStatistics,
    insuranceStatisticsLoading,
    insuranceStatisticsResponse,

    initialInsurancesParams,
    getInsuranceType,

    insuranceDashboardSettings
  };
};

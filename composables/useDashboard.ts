import { ref, watch } from "vue";
import useApi from "./useApi";
import * as t from "@/types/dashboard";
import { ElNotification } from "element-plus";
import type { IInsurancesStatisticParams } from "@/types/insurances";

export const useDashboard = () => {
  const {
    loading: fetchInspectionsDashboardLoading,
    response: InspectionsDashboard,
    request: fetchInspectionsDashboard,
  } = useApi<t.IInspectionsDashboard[]>({
    url: `/api/v1/dashboards/technical_inspections/vehicles`,
    method: "GET",
  });
  const {
    loading: fetchFinesDashboardLoading,
    response: FinesDashboard,
    request: fetchFinesDashboard,
  } = useApi<t.IFinesDashboard>({
    url: "/api/v1/dashboards/fines",
    method: "GET",
  });
  const {
    loading: fetchDebtDashboardLoading,
    response: DebtDashboard,
    request: fetchDebtDashboard,
  } = useApi<t.IDebtDashboard>({
    dynamicUrl: (p) => `/api/v1/dashboards/debt`,
    method: "GET",
  });
  const {
    loading: fetchDriverDebtDashboardLoading,
    response: DriverDebtDashboard,
    request: fetchDriverDebtDashboard,
  } = useApi<t.IDriverDebtDashboard>({
    dynamicUrl: (p) => `/api/v1/dashboards/driver_debt`,
    method: "GET",
  });
  const {
    loading: fetchInsurancesDashboardLoading,
    response: InsurancesDashboard,
    request: fetchInsurancesDashboard,
  } = useApi<t.IInsurancesDashboard[]>({
    url: "/api/v1/dashboards/insurances_dashboard/vehicles",
    method: "GET",
  });
  const {
    loading: fetchDiagnosticCountDashboardLoading,
    response: DiagnosticCountDashboard,
    request: fetchDiagnosticCountDashboard,
  } = useApi<t.IDiagnosticCountDashboard>({
    url: "/api/v1/dashboards/diagnostic_cards/count",
    method: "GET",
  });
  const {
    loading: fetchDiagnosticDashboardLoading,
    response: DiagnosticDashboard,
    request: fetchDiagnosticDashboard,
  } = useApi<t.IDiagnosticDashboard[]>({
    url: "/api/v1/dashboards/diagnostic_cards/vehicles",
    method: "GET",
  });
  const {
    loading: fetchFinanceDashboardLoading,
    response: FinanceDashboard,
    request: fetchFinanceDashboard,
    error: errorFinanceDashboard,
  } = useApi<{ amount: string }, t.IFinanceDasboardParams>({
    url: "/api/v1/dashboards/finance",
    method: "GET",
  });
  const {
    loading: insuranceDashboardStatisticsLoading,
    response: insuranceDashboardStatisticsResponse,
    request: fetchInsuranceDashboardStatistics,
  } = useApi<
    {
      active: number;
      expires_soon: number;
      wo_insurance: number;
    },
    IInsurancesStatisticParams
  >({
    url: "/api/v1/vehicles/insurances/all/stats",
    method: "GET",
  });

  const STORAGE_DEBT_KEY = "dashboard_debt_filters";
  const STORAGE_DRIVER_KEY = "dashboard_driver_filters";
  const STORAGE_INSURANCE_KEY = "dashboard_insurance_statistic_filter";

  function loadLocalFilter(key: string, defaultValue: any) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  const dashBoardInsuranceStatisticSettings = ref(
    loadLocalFilter(STORAGE_INSURANCE_KEY, {
      insurance_types_active: ["kasko", "osago", "osgop"],
      insurance_types_expires: ["kasko", "osago", "osgop"],
      cars_without_insurance_types: ["kasko", "osago", "osgop"],
    }),
  );

  const dashBoardSettings = ref(
    loadLocalFilter(STORAGE_DEBT_KEY, {
      onlyDebtIncluded: true,
      balanceOperations: [
        "redemption",
        "toll_road",
        "unallocated_funds",
        "repayment_damage",
        "repayment_deposit",
        "fine",
        "repayment_franchise",
        "rent",
        "other",
      ],
    }),
  );

  const dashBoardDriverSettings = ref(
    loadLocalFilter(STORAGE_DRIVER_KEY, {
      onlyDebtIncluded: true,
      balanceOperations: [
        "redemption",
        "toll_road",
        "unallocated_funds",
        "repayment_damage",
        "repayment_deposit",
        "fine",
        "repayment_franchise",
        "rent",
        "other",
      ],
    }),
  );

  watch(
    dashBoardSettings,
    (v) => localStorage.setItem(STORAGE_DEBT_KEY, JSON.stringify(v)),
    { deep: true },
  );

  watch(
    dashBoardDriverSettings,
    (v) => localStorage.setItem(STORAGE_DRIVER_KEY, JSON.stringify(v)),
    { deep: true },
  );

  watch(
    dashBoardInsuranceStatisticSettings,
    (v) => localStorage.setItem(STORAGE_INSURANCE_KEY, JSON.stringify(v)),
    { deep: true },
  );

  const fetchFinanceDashboardStats = async (
    start_date?: string,
    end_date?: string,
  ): Promise<void> => {
    const categories = ["rent", "redemption", "other"] as const;
    const types = ["accrual", "profit"] as const;

    try {
      const requests: Promise<void>[] = [];

      for (const category of categories) {
        for (const type of types) {
          const req = (async () => {
            const response = await fetchFinanceDashboard({
              operation_category: category,
              operation_type: type,
              filter_date_from: start_date,
              filter_date_to: end_date,
            });

            dashboardFinanceStats.value[category][type] =
              response?.amount ?? "";
          })();

          requests.push(req);
        }
      }

      await Promise.all(requests);
    } catch (e) {
      console.log("", errorFinanceDashboard.value);

      ElNotification({
        title: errorFinanceDashboard.value?.title ?? "Ошибка",
        message:
          errorFinanceDashboard.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const dashboardFinanceStats = ref({
    rent: {
      title: "Аренда авто",
      accrual: "",
      profit: "",
      color: "#7973F3",
    },
    redemption: {
      title: "Выкуп авто",
      accrual: "",
      profit: "",
      color: "#318AFF",
    },
    other: {
      title: "Прочее",
      accrual: "",
      profit: "",
      color: "#1FD2D2",
    },
  });

  const balanceOperationsCategory = {
    deposit: "Депозит",
    franchise: "Франшиза",
    rent: "Аренда",
    fine: "Штраф ГИБДД",
    damage: "Ущерб",
    toll_road: "Платные дороги",
    repayment_damage: "Долг по ущербам",
    repayment_franchise: "Долг по франшизе",
    redemption: "Выкуп",
    repayment_deposit: "Долг за депозит",
    unallocated_funds: "Внутренний баланс",
    other: "Прочее",
  };

  const balanceOperationsCategoryColors = {
    deposit: "#A3D9FF",
    franchise: "#F3B3C2",
    rent: "#7973F3",
    fine: "#F8BD7F",
    damage: "#DC55B6",
    toll_road: "#7F95F3",
    repayment_damage: "#86BCE0",
    repayment_franchise: "#F3C88E",
    redemption: "#D7AFFF",
    repayment_deposit: "#8FD4C1",
    unallocated_funds: "#C4C4C4",
    other: "#89E086",
  };

  const insuranceTypes = {
    kasko: "КАСКО",
    osago: "ОСАГО",
    osgop: "ОСГОП",
  };

  return {
    fetchInspectionsDashboardLoading,
    fetchFinesDashboardLoading,
    fetchDebtDashboardLoading,
    fetchDriverDebtDashboardLoading,
    fetchDiagnosticCountDashboardLoading,
    fetchInsurancesDashboardLoading,
    fetchDiagnosticDashboardLoading,
    fetchFinanceDashboardLoading,

    InspectionsDashboard,
    FinesDashboard,
    DebtDashboard,
    DriverDebtDashboard,
    DiagnosticCountDashboard,
    InsurancesDashboard,
    DiagnosticDashboard,
    dashboardFinanceStats,

    fetchInspectionsDashboard,
    fetchFinesDashboard,
    fetchDebtDashboard,
    fetchDriverDebtDashboard,
    fetchInsurancesDashboard,
    fetchDiagnosticCountDashboard,
    fetchDiagnosticDashboard,
    fetchFinanceDashboardStats,

    dashBoardSettings,
    dashBoardDriverSettings,
    balanceOperationsCategory,
    balanceOperationsCategoryColors,
    insuranceTypes,

    //insuranceDashboardStatistic
    insuranceDashboardStatisticsLoading,
    insuranceDashboardStatisticsResponse,
    fetchInsuranceDashboardStatistics,
    dashBoardInsuranceStatisticSettings,
  };
};

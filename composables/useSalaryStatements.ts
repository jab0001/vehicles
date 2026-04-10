import { computed, ref } from "vue";
import useApi from "@/composables/useApi";

import * as t from "@/types/salaryStatements";
import type { IPagination } from "@/types/apiDefault";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useAppStore } from "@/stores/appStore";
import { useHelpers } from "./useHelpers";

export const useSalaryStatements = () => {
  // Statements
  const {
    loading: statementListLoading,
    response: statementListResponse,
    request: fetchStatementList,
  } = useApi<IPagination<t.IStatementDataResponse>, t.IStatementListParams>({
    url: "/api/v1/salary_statements",
    method: "GET",
  });
  const {
    loading: statementLoading,
    response: statementResponse,
    request: fetchStatement,
  } = useApi<t.IStatementDataResponse, { ss_id: number }>({
    dynamicUrl: (p) => `/api/v1/salary_statements/${p.ss_id}`,
    method: "GET",
  });
  const {
    loading: createStatementLoading,
    error: createStatementError,
    response: createStatementResponse,
    request: createStatementRequest,
  } = useApi<t.IStatementCreateForm>({
    url: "/api/v1/salary_statements",
    method: "POST",
  });
  const {
    loading: updateStatementStatusLoading,
    error: updateStatementStatusError,
    response: updateStatementStatusResponse,
    request: updateStatementStatusRequest,
  } = useApi<{ ss_id: Number; new_status: "PENDING" | "PAID" | "CANCELED" }>({
    dynamicUrl: (p) => `/api/v1/salary_statements/${p.ss_id}/status`,
    method: "POST",
  });
  const {
    loading: recalculateStatementLoading,
    error: recalculateStatementError,
    response: recalculateStatementResponse,
    request: recalculateStatementRequest,
  } = useApi<{ ss_id: number }>({
    dynamicUrl: (p) => `/api/v1/salary_statements/${p.ss_id}/recalculate`,
    method: "POST",
  });
  // Driver Statements

  const {
    loading: driverListLoading,
    response: driverListResponse,
    request: fetchDriversList,
  } = useApi<t.IStatementDriversDataResponse[], { ss_id: number }>({
    dynamicUrl: (p) => `/api/v1/salary_statements/${p.ss_id}/drivers`,
    method: "GET",
  });
  const {
    loading: driverLoading,
    response: driverResponse,
    request: fetchDriver,
  } = useApi<
    t.IStatementDriversDataResponse,
    { ss_id: number; ss_driver_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}`,
    method: "GET",
  });
  const {
    loading: deleteDriverLoading,
    error: deleteDriverError,
    response: deleteDriverResponse,
    request: deleteDriverRequest,
  } = useApi<{ ss_id: number; ss_driver_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}`,
    method: "DELETE",
  });
  const {
    loading: updateDriverLoading,
    error: updateDriverError,
    response: updateDriverResponse,
    request: updateDriverRequest,
  } = useApi<{ ss_id: number; ss_driver_id: string } & t.IUpdateDriverForm>({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/manual_balances`,
    method: "POST",
  });
  const {
    loading: recalculateDriverLoading,
    error: recalculateDriverError,
    response: recalculateDriverResponse,
    request: recalculateDriverRequest,
  } = useApi<{ ss_id: number; ss_driver_id: string }>({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/recalculate`,
    method: "POST",
  });
  // Shifts

  const {
    loading: shiftListLoading,
    response: shiftListResponse,
    request: fetchShiftList,
  } = useApi<t.IShiftResponse[], { ss_id: number; ss_driver_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/shifts`,
    method: "GET",
  });
  const {
    loading: shiftLoading,
    response: shiftResponse,
    request: fetchShift,
  } = useApi<
    t.IShiftResponse,
    { ss_id: number; ss_driver_id: number; ss_shift_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/shifts/${p.ss_shift_id}`,
    method: "GET",
  });
  //Rides
  const {
    loading: rideListLoading,
    response: rideListResponse,
    request: fetchRideList,
  } = useApi<
    t.IRideResponse[],
    { ss_id: number; ss_driver_id: number; ss_shift_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/shifts/${p.ss_shift_id}/rides`,
    method: "GET",
  });
  const {
    loading: rideLoading,
    response: rideResponse,
    request: fetchRide,
  } = useApi<
    t.IRideResponse,
    {
      ss_id: number;
      ss_driver_id: number;
      ss_shift_id: number;
      ss_ride_id: number;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/salary_statements/${p.ss_id}/drivers/${p.ss_driver_id}/shifts/${p.ss_shift_id}/rides/${p.ss_ride_id}`,
    method: "GET",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const statementListParams = ref<t.IStatementListParams>({
    status: undefined,
    start_date: undefined,
    end_date: undefined,
    limit: 20,
    page: 1,
    order_by: undefined,
    direction: undefined,
  });

  const statementList = computed(() => {
    return statementListResponse.value?.items ?? [];
  });

  const statementListTotalPages = computed(() => {
    return statementListResponse.value?.total_items ?? 0;
  });

  const getEmptyForm = (): t.IStatementCreateForm => ({
    month: undefined,
    type: undefined,
    driver_ids: [],
  });

  const createSalaryStatementsForm =
    ref<t.IStatementCreateForm>(getEmptyForm());

  const createSalaryStatementsRef = ref<FormInstance>();
  const createSalaryStatementsRules = computed<FormRules>(() => {
    return {
      month: [
        {
          required: true,
          message: "Выберите период",
          trigger: "change",
        },
      ],
      type: [
        {
          required: true,
          message: "Введите тип ведомости",
          trigger: "change",
        },
      ],
      driver_ids: [
        {
          type: "array",
          required: true,
          min: 1,
          message: "Выберите хотя бы одного водителя",
          trigger: "change",
        },
      ],
    };
  });

  const chooseDriversModal = ref(false);
  const detailedRideAndShiftsModal = ref(false);

  const resetCreateSalaryStatementsForm = () => {
    createSalaryStatementsForm.value = getEmptyForm();
  };

  const createSalaryStatements = async () => {
    validatePromise(createSalaryStatementsRef.value!).then(async () => {
      try {
        await createStatementRequest({
          ...createSalaryStatementsForm.value,
        });
        await fetchStatementList({
          ...statementListParams.value,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Ведомость сформирована",
          type: "success",
        });
        hideDrawer();
        resetCreateSalaryStatementsForm();
      } catch (e) {
        ElNotification({
          title: createStatementError.value?.title ?? "Ошибка",
          message:
            createStatementError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const getStatementType = (status: string) => {
    switch (status) {
      case "ADVANCE":
        return "Авансовая";
      case "FINAL":
        return "Итоговая";
      default:
        return "";
    }
  };

  const getStatementStatus = (status: string) => {
    switch (status) {
      case "PAID":
        return "Выплачено";
      case "PENDING":
        return "На выплату";
      case "CANCELED":
        return "Аннулирована";
      default:
        return "";
    }
  };

  const filteredStatementOrdersListId = ref<number | null>(null);
  const filteredStatementTransactionListId = ref<number | null>(null);
  return {
    statementList,
    statementListTotalPages,
    statementListParams,
    statementListLoading,
    fetchStatementList,

    // create statement
    createSalaryStatementsForm,
    createSalaryStatementsRef,
    createSalaryStatementsRules,
    resetCreateSalaryStatementsForm,

    chooseDriversModal,
    detailedRideAndShiftsModal,

    createSalaryStatements,
    createStatementLoading,

    // recalculate statement
    recalculateStatementLoading,
    recalculateStatementError,
    recalculateStatementResponse,
    recalculateStatementRequest,

    // one statement
    statementLoading,
    statementResponse,
    fetchStatement,

    // update statement
    updateStatementStatusLoading,
    updateStatementStatusError,
    updateStatementStatusResponse,
    updateStatementStatusRequest,

    // statement drivers
    driverListLoading,
    driverListResponse,
    fetchDriversList,

    //one driver statement
    driverLoading,
    driverResponse,
    fetchDriver,

    //update driver
    updateDriverLoading,
    updateDriverError,
    updateDriverResponse,
    updateDriverRequest,

    //recalculate driver
    recalculateDriverLoading,
    recalculateDriverError,
    recalculateDriverResponse,
    recalculateDriverRequest,

    //delete driver
    deleteDriverLoading,
    deleteDriverError,
    deleteDriverResponse,
    deleteDriverRequest,

    //shifts
    shiftListLoading,
    shiftListResponse,
    fetchShiftList,

    //rides
    rideListLoading,
    rideListResponse,
    fetchRideList,

    // helpers
    getStatementType,
    getStatementStatus,

    // filtered lists (order, transactions)
    filteredStatementOrdersListId,
    filteredStatementTransactionListId,
  };
};

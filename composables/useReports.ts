import { ref, reactive, watch } from "vue";
import {
  type FormInstance,
  type FormRules,
  ElNotification,
  dayjs,
} from "element-plus";
import { useFiles } from "@/composables/useFiles";
import useApi from "./useApi";
import { useAppStore } from "@/stores/appStore";
import { useHelpers } from "@/composables/useHelpers";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

import type { TBalanceOperationsCategory } from "@/types/balanceOperations";
import type {
  TFineDatetimeType,
  TFineLocalStatus,
  TFineStatus,
} from "@/types/fines";

interface IReportBalanceOperation {
  start_date: string;
  end_date: string;
  operation_categories: TBalanceOperationsCategory[];
  driver_id: undefined | number;
  vehicle_id: undefined | number;
}

export const useReportsBalanceOperations = () => {
  const {
    request: reportBalanceOperationRequest,
    response: reportBalanceOperationResp,
    loading: reportBalanceOperationLoading,
  } = useApi<Blob, IReportBalanceOperation>({
    dynamicUrl: (p) => {
      let url = `/api/v1/statistics/operation_type?start_date=${p.start_date}&end_date=${p.end_date}`;
      if (p.operation_categories.length) {
        url += p.operation_categories
          .map((category) => `&operation_categories=${category}`)
          .join("");
      }
      if (p.driver_id) {
        url += `&driver_id=${p.driver_id}`;
      }
      return url;
    },
    method: "POST",
    responseType: "blob",
  });

  const { downloadFile } = useFiles();
  const { validatePromise } = useHelpers();
  const { hideDrawer } = useAppStore();

  const balanceOperationReportRef = ref<FormInstance>();
  const balanceOperationReportRules = reactive<FormRules>({
    start_date: [
      {
        required: true,
        message: "Введите дату начала",
        trigger: "change",
      },
    ],
    end_date: [
      {
        required: true,
        message: "Введите дату конца",
        trigger: "change",
      },
    ],
  });
  const balanceOperationReportForm = ref<IReportBalanceOperation>({
    start_date: "",
    end_date: "",
    operation_categories: [],
    driver_id: undefined,
    vehicle_id: undefined,
  });

  const handleCreateBalanceOperationsReport = () => {
    validatePromise(balanceOperationReportRef.value!).then(async () => {
      reportBalanceOperationRequest({
        ...balanceOperationReportForm.value,
      }).then((res) => {
        const categoriesString =
          balanceOperationReportForm.value.operation_categories.length > 0
            ? `${balanceOperationReportForm.value.operation_categories.join("-")}`
            : "";

        const fileName =
          [
            "balance-operations",
            balanceOperationReportForm.value.start_date,
            balanceOperationReportForm.value.end_date,
            categoriesString,
          ]
            .filter(Boolean)
            .join("-") + ".xlsx";
        downloadFile({
          // @ts-ignore
          id: "_",
          name: fileName,
          blob: res,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Отчет по арендам готов",
          type: "success",
        });
        hideDrawer();
      });
    });
  };

  return {
    reportBalanceOperationRequest,
    reportBalanceOperationLoading,

    balanceOperationReportRef,
    balanceOperationReportRules,
    balanceOperationReportForm,
    handleCreateBalanceOperationsReport,
  };
};

export const useReportsRent = () => {
  const {
    request: reportRentRequest,
    response: reportRentResp,
    loading: reportRentLoading,
  } = useApi<
    Blob,
    {
      start_date: string;
      end_date: string;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/statistics/rent_by_driver?start_date=${p.start_date}&end_date=${p.end_date}`,
    method: "POST",
    responseType: "blob",
  });

  const { downloadFile } = useFiles();
  const { validatePromise } = useHelpers();
  const { hideDrawer } = useAppStore();
  const rentReportRef = ref<FormInstance>();
  const rentReportRules = reactive<FormRules>({
    start_date: [
      {
        required: true,
        message: "Введите дату начала",
        trigger: "change",
      },
    ],
    end_date: [
      {
        required: true,
        message: "Введите дату конца",
        trigger: "change",
      },
    ],
  });
  const rentReportForm = ref({
    start_date: "",
    end_date: "",
  });

  const handleCreateRentReport = () => {
    validatePromise(rentReportRef.value!).then(async () => {
      reportRentRequest({
        ...rentReportForm.value,
      }).then((res) => {
        downloadFile({
          // @ts-ignore
          id: "_",
          name: `rent-${rentReportForm.value.start_date}-${rentReportForm.value.end_date}.xlsx`,
          blob: res,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Отчет по арендам готов",
          type: "success",
        });
        hideDrawer();
      });
    });
  };

  return {
    reportRentRequest,
    reportRentLoading,

    rentReportRef,
    rentReportRules,
    rentReportForm,
    handleCreateRentReport,
  };
};

export const useReportsVehicle = () => {
  const { downloadFile } = useFiles();
  const { request: reportVehicleRequest, loading: reportVehicleLoading } =
    useApi<
      Blob,
      {
        start_date: string;
        end_date: string;
        vehicles_ids: number[] | null;
      }
    >({
      dynamicUrl: (p) =>
        `/api/v1/statistics/vehicles_money?start_date=${p.start_date}&end_date=${p.end_date}`,
      method: "POST",
      responseType: "blob",
    });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const vehicleReportRef = ref<FormInstance>();
  const vehicleReportRules = reactive<FormRules>({
    start_date: [
      {
        required: true,
        message: "Выберите Период",
        trigger: "change",
      },
    ],
  });
  const vehicleReportForm = ref({
    vehicles_ids: [],
    all_period: false,
    start_date: "",
    end_date: "",
  });

  const handleCreateVehicleReport = () => {
    validatePromise(vehicleReportRef.value!).then(async () => {
      reportVehicleRequest({
        start_date: vehicleReportForm.value.start_date,
        end_date: vehicleReportForm.value.end_date,
        vehicles_ids: vehicleReportForm.value.vehicles_ids?.length
          ? vehicleReportForm.value.vehicles_ids
          : null,
        // vehicles_ids: null,
      }).then((res) => {
        downloadFile({
          // @ts-ignore
          id: "_",
          name: `vehicle-${vehicleReportForm.value.start_date}-${vehicleReportForm.value.end_date}.xlsx`,
          blob: res,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Отчет по автомобилю готов",
          type: "success",
        });
        hideDrawer();
      });
    });
  };

  return {
    vehicleReportRef,
    vehicleReportRules,
    vehicleReportForm,
    reportVehicleLoading,

    handleCreateVehicleReport,
  };
};

interface IReportFines {
  driver_id: undefined | number;
  vehicle_id: undefined | number;
  local_statuses?: TFineLocalStatus[];
  fine_statuses?: TFineStatus[];
  datetime_start?: string;
  datetime_end?: string;
  datetime_type: TFineDatetimeType;
  fine_source?: "external" | "internal";
}

export const useReportsFines = () => {
  const { downloadFile } = useFiles();
  const { validatePromise } = useHelpers();
  const { hideDrawer } = useAppStore();

  const finesReportRef = ref<FormInstance>();
  const finesReportRules = reactive<FormRules>({});
  const finesReportForm = ref<IReportFines>({
    driver_id: undefined,
    vehicle_id: undefined,
    local_statuses: [],
    fine_statuses: [],
    datetime_start: undefined,
    datetime_end: undefined,
    datetime_type: "created_at",
    fine_source: undefined,
  });

  const handleCreateFinesReport = () => {
    const {
      driver_id,
      vehicle_id,
      local_statuses,
      fine_statuses,
      datetime_start,
      datetime_end,
      datetime_type,
      fine_source,
    } = finesReportForm.value;
    validatePromise(finesReportRef.value!).then(async () => {
      try {
        const params = new URLSearchParams();

        if (driver_id) params.append("driver_id", String(driver_id));
        if (vehicle_id) params.append("vehicle_id", String(vehicle_id));

        if (local_statuses && local_statuses.length > 0) {
          local_statuses.forEach((status) => {
            params.append("local_statuses", String(status));
          });
        }
        if (fine_statuses && fine_statuses.length > 0) {
          fine_statuses.forEach((status) => {
            params.append("fine_statuses", String(status));
          });
        }
        if (datetime_start && datetime_end) {
          params.append("datetime_start", datetime_start);
          params.append("datetime_end", datetime_end);
        }
        if (datetime_type && datetime_start && datetime_end) params.append("datetime_type", datetime_type);
        if (fine_source) params.append("fine_source", fine_source);

        const result = await axios.get(`${MAIN_ENDPOINT}api/v1/fines/report`, {
          params,
          responseType: "blob",
        });

        downloadFile({
          // @ts-ignore
          id: "_",
          name: `fines_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
          blob: result.data,
        });

        ElNotification({
          title: "Успешный запрос",
          message: "Список штрафов получен",
          type: "success",
        });

        hideDrawer();
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
            message:
              e.message || "Произошла ошибка, обратитесь к администратору",
            type: "error",
          });
        }
      }
    });
  };

  return {
    finesReportRef,
    finesReportRules,
    finesReportForm,
    handleCreateFinesReport,
  };
};

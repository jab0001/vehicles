import { computed, ref, reactive, watch } from "vue";
import {
  dayjs,
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";

import useApi from "@/composables/useApi";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";

import {
  formatDateToServer,
  formatDateTimeToServer,
} from "@/helpers/format.helpers";

import * as t from "@/types/workingShifts";
import type { IVehicle } from "@/types/vehicles";
import type { throwError } from "element-plus/es/utils/error.mjs";

export const useWorkingShifts = () => {
  const {
    loading: workingShiftsListLoading,
    response: workingShiftsResponse,
    request: fetchWorkingShiftsList,
  } = useApi<t.IWorkingShiftsDataResponse, t.IWorkingShiftsListParams>({
    url: "/api/v1/working_shift",
    method: "GET",
  });
  const {
    loading: workingShiftsRecordsListLoading,
    error: workingShiftsRecordsListError,
    response: workingShiftsRecordsResponse,
    request: fetchWorkingShiftsRecordsList,
  } = useApi<t.IWorkingShiftsRecordsResponse[], t.IWorkingShiftsListParams>({
    url: "/api/v1/working_shift/records",
    method: "GET",
  });
  const {
    loading: prevWorkingShiftsListLoading,
    response: prevWorkingShiftsResponse,
    request: prevFetchWorkingShiftsList,
  } = useApi<t.IWorkingShiftsDataResponse, t.IWorkingShiftsListParams>({
    url: "/api/v1/working_shift",
    method: "GET",
  });
  const {
    loading: getPrevWorkingShiftLoading,
    error: getPrevWorkingShiftError,
    response: getPrevWorkingShiftResponse,
    request: getPrevWorkingShiftRequest,
  } = useApi<{ working_shift_id: number; new_month: string }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/copy?new_month=${p.new_month}`,
    method: "POST",
    postBodyParams: true,
  });
  const {
    loading: addWorkingShiftVehicleLoading,
    error: addWorkingShiftVehicleError,
    response: addWorkingShiftVehicleResponse,
    request: addWorkingShiftVehicleRequest,
  } = useApi<{ working_shift_id: number; vehicle_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}`,
    method: "POST",
  });
  const {
    loading: deleteWorkingShiftVehicleLoading,
    error: deleteWorkingShiftVehicleError,
    response: deleteWorkingShiftVehicleResponse,
    request: deleteWorkingShiftVehicleRequest,
  } = useApi<{ working_shift_id: number; vehicle_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}`,
    method: "DELETE",
  });
  const {
    loading: restoreWorkingShiftVehicleLoading,
    error: restoreWorkingShiftVehicleError,
    response: restoreWorkingShiftVehicleResponse,
    request: restoreWorkingShiftVehicleRequest,
  } = useApi<{ working_shift_id: number; vehicle_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}/restore`,
    method: "GET",
  });
  const {
    loading: addWorkingShiftDriverLoading,
    error: addWorkingShiftDriverError,
    response: addWorkingShiftDriverResponse,
    request: addWorkingShiftDriverRequest,
  } = useApi<{
    working_shift_id: number;
    vehicle_id: number;
    driver_id: number;
  }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}/driver/${p.driver_id}`,
    method: "POST",
  });
  const {
    loading: deleteWorkingShiftDriverLoading,
    error: deleteWorkingShiftDriverError,
    response: deleteWorkingShiftDriverResponse,
    request: deleteWorkingShiftDriverRequest,
  } = useApi<{
    working_shift_id: number;
    vehicle_id: number;
    driver_id: number;
  }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}/driver/${p.driver_id}`,
    method: "DELETE",
  });
  const {
    loading: restoreWorkingShiftDriverLoading,
    error: restoreWorkingShiftDriverError,
    response: restoreWorkingShiftDriverResponse,
    request: restoreWorkingShiftDriverRequest,
  } = useApi<{
    working_shift_id: number;
    vehicle_id: number;
    driver_id: number;
  }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/vehicle/${p.vehicle_id}/driver/${p.driver_id}/restore`,
    method: "GET",
  });
  const {
    loading: addWorkingShiftAutomaticLoading,
    error: addWorkingShiftAutomaticError,
    response: addWorkingShiftAutomaticResponse,
    request: addWorkingShiftAutomaticRequest,
  } = useApi<{ working_shift_id: number }>({
    dynamicUrl: (p) => `/api/v1/working_shift/${p.working_shift_id}/automatic`,
    method: "POST",
  });

  const {
    loading: createRecorLoading,
    error: createRecordError,
    response: createRecordResponse,
    request: createRecordRequest,
  } = useApi<{ working_shift_id: number }>({
    dynamicUrl: (p) => `/api/v1/working_shift/${p.working_shift_id}/record`,
    method: "POST",
  });

  const {
    loading: updateRecordLoading,
    error: updateRecordError,
    response: updateRecordResponse,
    request: updateRecordRequest,
  } = useApi<{ working_shift_id: number; record_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/record/${p.record_id}`,
    method: "PUT",
  });

  const {
    loading: deleteRecordLoading,
    error: deleteRecordError,
    response: deleteRecordResponse,
    request: deleteRecordRequest,
  } = useApi<{ working_shift_id: number; record_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/working_shift/${p.working_shift_id}/record/${p.record_id}`,
    method: "DELETE",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const workingShiftsParams = ref<t.IWorkingShiftsListParams>({
    month: dayjs().startOf("month").format("YYYY-MM-01"),
  });
  const onlyActiveVehicles = ref<boolean>(false);

  const prevMonth = computed(() =>
    dayjs(workingShiftsParams.value.month)
      .subtract(1, "month")
      .format("YYYY-MM-01"),
  );

  const workingShiftsData = computed<t.IWorkingShiftsDataResponse | null>(
    () => {
      const data = workingShiftsResponse.value;

      if (!data) return null;

      if (onlyActiveVehicles.value) {
        return {
          ...data,
          vehicles: data.vehicles.filter((v) => v.status === "ACTIVE"),
        };
      }

      return data;
    },
  );

  const getEmptyForm = (): t.ICreateWorkingShiftsAutomaticForm => ({
    vehicle_id: undefined,
    start_date: undefined,
    end_date: undefined,
    start_time: "08:00:00.000Z",
    override_existing: null,
    drivers: [
      {
        driver_id: undefined,
        working_hours: 1,
        break_hours: 0,
        working_shift_condition_id: null,
      },
    ],
  });

  const createWorkingShiftsAutomaticForm =
    ref<t.ICreateWorkingShiftsAutomaticForm>(getEmptyForm());

  const createWorkingShiftsAutomaticRef = ref<FormInstance>();
  const createWorkingShiftsAutomaticRules = computed<FormRules>(() => {
    return {
      vehicle_id: [
        {
          required: true,
          message: "Выберите автомобиль",
          trigger: "change",
        },
      ],
      start_date: [
        {
          required: true,
          message: "Введите дату",
          trigger: "change",
        },
      ],
      ...createWorkingShiftsAutomaticForm.value.drivers.reduce(
        (rules, driver, index) => {
          rules[`drivers.${index}.driver_id`] = [
            {
              required: true,
              message: "Выберете водителя",
              trigger: "blur",
            },
          ];
          return rules;
        },
        {} as FormRules,
      ),
      ...createWorkingShiftsAutomaticForm.value.drivers.reduce(
        (rules, driver, index) => {
          rules[`drivers.${index}.working_shift_condition_id`] = [
            {
              required: true,
              message: "Выберете смену",
              trigger: "blur",
            },
          ];
          return rules;
        },
        {} as FormRules,
      ),
    };
  });

  const noticeAutomaticModal = ref(false);

  const resetCreateWorkingShiftsAutomaticForm = () => {
    createWorkingShiftsAutomaticForm.value = getEmptyForm();
  };

  const addVehicleToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
  ): Promise<void> => {
    try {
      await addWorkingShiftVehicleRequest({
        working_shift_id,
        vehicle_id,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Автомобиль добавлен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: addWorkingShiftVehicleError.value?.title ?? "Ошибка",
        message:
          addWorkingShiftVehicleError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const deleteVehicleToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
    mark_not_active: boolean,
  ): Promise<void> => {
    try {
      await deleteWorkingShiftVehicleRequest({
        working_shift_id,
        vehicle_id,
        mark_not_active,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: mark_not_active ? "Автомобиль удален" : "Смены удалены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: deleteWorkingShiftVehicleError.value?.title ?? "Ошибка",
        message:
          deleteWorkingShiftVehicleError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const restoreVehicleToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
  ): Promise<void> => {
    try {
      await restoreWorkingShiftVehicleRequest({
        working_shift_id,
        vehicle_id,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Автомобиль восстановлен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: restoreWorkingShiftVehicleError.value?.title ?? "Ошибка",
        message:
          restoreWorkingShiftVehicleError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const addDriverToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
    driver_id: number,
  ): Promise<void> => {
    try {
      await addWorkingShiftDriverRequest({
        working_shift_id,
        vehicle_id,
        driver_id,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Водитель добавлен к автомобилю",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: addWorkingShiftDriverError.value?.title ?? "Ошибка",
        message:
          addWorkingShiftDriverError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const deleteDriverToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
    driver_id: number,
    mark_not_active: boolean,
  ): Promise<void> => {
    try {
      await deleteWorkingShiftDriverRequest({
        working_shift_id,
        vehicle_id,
        driver_id,
        mark_not_active,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: mark_not_active ? "Водитель удален" : "Смены удалены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: deleteWorkingShiftDriverError.value?.title ?? "Ошибка",
        message:
          deleteWorkingShiftDriverError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const restoreDriverToWorkingShift = async (
    working_shift_id: number,
    vehicle_id: number,
    driver_id: number,
  ): Promise<void> => {
    try {
      await restoreWorkingShiftDriverRequest({
        working_shift_id,
        vehicle_id,
        driver_id,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Водитель восстановлен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: restoreWorkingShiftDriverError.value?.title ?? "Ошибка",
        message:
          restoreWorkingShiftDriverError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const createWorkingShiftsAutomatic = async () => {
    validatePromise(createWorkingShiftsAutomaticRef.value!).then(async () => {
      try {
        await addWorkingShiftAutomaticRequest({
          working_shift_id: workingShiftsData?.value?.id,
          ...createWorkingShiftsAutomaticForm.value,
        });
        await fetchWorkingShiftsList({
          month: workingShiftsParams.value.month,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Смены создана",
          type: "success",
        });
        noticeAutomaticModal.value = false;
        hideDrawer();
        resetCreateWorkingShiftsAutomaticForm();
      } catch (e) {
        console.log("ERROR", addWorkingShiftAutomaticError.value);
        if (addWorkingShiftAutomaticError.value?.code === 409) {
          noticeAutomaticModal.value = true;
          return;
        }

        ElNotification({
          title: addWorkingShiftAutomaticError.value?.title ?? "Ошибка",
          message:
            addWorkingShiftAutomaticError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const recordFormDefault = {
    vehicle_name: "",
    driver_name: "",
    working_shift_condition_id: null,
    period: {
      start: "",
      end: "",
    },
    status: "",
    working_shift_vehicle_id: 0,
    working_shift_driver_id: 0,
    record_id: undefined,
  };

  const recordForm = ref({ ...recordFormDefault });

  const recordFormRef = ref<FormInstance>();
  const recordFormRules = reactive({
    working_shift_condition_id: [
      {
        required: true,
        message: "Выберите условия работы",
        trigger: "change",
      },
    ],
    "period.start": [
      {
        required: true,
        message: "Введите начало смены",
        trigger: "change",
      },
    ],
    "period.end": [
      {
        required: true,
        message: "Введите конец смены",
        trigger: "change",
      },
    ],
  });

  const clearRecordForm = () => {
    recordForm.value = { ...recordFormDefault };
  };

  const createRecord = async () => {
    const data = {
      working_shift_condition_id: recordForm.value.working_shift_condition_id,
      period: {
        start: recordForm.value.period.start,
        end: recordForm.value.period.end,
      },
      status: recordForm.value.status,
      working_shift_vehicle_id: recordForm.value.working_shift_vehicle_id,
      working_shift_driver_id: recordForm.value.working_shift_driver_id,
    };

    validatePromise(recordFormRef.value!).then(async () => {
      try {
        await createRecordRequest({
          working_shift_id: workingShiftsData?.value?.id,
          ...data,
        });
        await fetchWorkingShiftsList({
          month: workingShiftsParams.value.month,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Смена создана",
          type: "success",
        });
        clearRecordForm();
      } catch (e) {
        ElNotification({
          title: createRecordError.value?.title ?? "Ошибка",
          message:
            createRecordError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const changeRecord = async () => {
    const data = {
      working_shift_condition_id: recordForm.value.working_shift_condition_id,
      period: {
        start: recordForm.value.period.start,
        end: recordForm.value.period.end,
      },
      status: recordForm.value.status,
    };
    validatePromise(recordFormRef.value!).then(async () => {
      try {
        await updateRecordRequest({
          working_shift_id: workingShiftsData?.value?.id,
          record_id: recordForm.value.record_id,
          ...data,
        });
        await fetchWorkingShiftsList({
          month: workingShiftsParams.value.month,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Смена обновлена",
          type: "success",
        });
        clearRecordForm();
      } catch (e) {
        ElNotification({
          title: updateRecordError.value?.title ?? "Ошибка",
          message:
            updateRecordError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const deleteRecord = async () => {
    try {
      await deleteRecordRequest({
        working_shift_id: workingShiftsData?.value?.id,
        record_id: recordForm.value.record_id,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Смена удалена",
        type: "success",
      });
      clearRecordForm();
    } catch (e) {
      ElNotification({
        title: deleteRecordError.value?.title ?? "Ошибка",
        message:
          deleteRecordError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const workingShiftsRecordsList = async (month: string, driver_ids: number[]) => {
    try {
      await fetchWorkingShiftsRecordsList({
        month,
        driver_ids,
      });
    } catch (e) {
      ElNotification({
        title: workingShiftsRecordsListError.value?.title ?? "Ошибка",
        message:
          workingShiftsRecordsListError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getPrevMonthWorkingShifts = async () => {
    try {
      await getPrevWorkingShiftRequest({
        working_shift_id: prevWorkingShiftsResponse?.value?.id,
        new_month: workingShiftsParams.value.month,
      });
      await fetchWorkingShiftsList({
        month: workingShiftsParams.value.month,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "График перенесен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: getPrevWorkingShiftError.value?.title ?? "Ошибка",
        message:
          getPrevWorkingShiftError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const shiftStatus = {
    WORK: { label: "Рабочая смена", color: "#409EFF" },
    CURRENT: { label: "Текущая", color: "#67C23A" },
    OVERLAP: { label: "Наложение", color: "#F56C6C" },
    TRUANCY: { label: "Прогул", color: "#E6A23C" },
    VACATION: { label: "Отпуск", color: "#A562FF" },
    FIRED: { label: "Уволен", color: "#6B7280" },
  };

  return {
    workingShiftsParams,
    prevMonth,
    shiftStatus,

    fetchWorkingShiftsList,
    prevFetchWorkingShiftsList,

    workingShiftsListLoading,

    workingShiftsData,
    prevWorkingShiftsResponse,
    onlyActiveVehicles,

    addVehicleToWorkingShift,
    deleteVehicleToWorkingShift,
    restoreVehicleToWorkingShift,

    addDriverToWorkingShift,
    deleteDriverToWorkingShift,
    restoreDriverToWorkingShift,

    createWorkingShiftsAutomaticForm,
    createWorkingShiftsAutomaticRef,
    createWorkingShiftsAutomaticRules,
    resetCreateWorkingShiftsAutomaticForm,
    createWorkingShiftsAutomatic,

    noticeAutomaticModal,

    recordForm,
    recordFormRef,
    recordFormRules,

    clearRecordForm,
    createRecord,
    changeRecord,
    deleteRecord,

    getPrevMonthWorkingShifts,

    // records

    workingShiftsRecordsListLoading,
    workingShiftsRecordsResponse,
    workingShiftsRecordsListError,
    workingShiftsRecordsList,
  };
};

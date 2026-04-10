import { computed, ref, reactive, watch } from "vue";
import {
  ElNotification,
  dayjs,
  type FormInstance,
  type FormRules,
} from "element-plus";

import useApi from "@/composables/useApi";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";

import * as t from "@/types/adjustmentsApplications";
import * as b from "@/types/balanceOperations";
import type { IPagination } from "@/types/apiDefault";

export const useAdjustmentsApplications = () => {
  const {
    loading: adjustmentsListLoading,
    response: adjustmentListResponse,
    request: fetchAdjustmentsList,
  } = useApi<
    IPagination<t.IAdjustmentsApplication>,
    t.IAdjustmeontOperationListParams
  >({
    url: "/api/v1/adjustment_requests",
    method: "GET",
  });
  const {
    loading: adjustmentDetailsLoading,
    response: adjustmentDetailsResult,
    request: fetchadjustmentDetails,
  } = useApi<t.IAdjustmentsApplication, t.IAdjustmeontOperationDetailsParams>({
    dynamicUrl: (p) => `/api/v1/adjustment_requests/${p.adjustment_id}`,
    method: "GET",
  });
  const {
    loading: createAdjustmentLoading,
    error: createAdjustmentError,
    response: newAdjustment,
    request: createAdjustmentRequest,
  } = useApi<t.IAdjustmentsApplication, t.IAdjustmentsApplicationCreateForm>({
    url: "/api/v1/adjustment_requests",
    method: "POST",
  });
  const {
    response: updateAdjustmentResponse,
    loading: updateAdjustmentLoading,
    error: updateAdjustmentError,
    request: updateAdjustmentRequest,
  } = useApi<t.IAdjustmentsApplication, t.IAdjustmeontOperationEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/adjustment_requests/${p.id}`,
  });
  const {
    response: updateAdjustmentStatusResponse,
    loading: updateAdjustmentStatusLoading,
    error: updateAdjustmentStatusError,
    request: updateAdjustmentStatusRequest,
  } = useApi<
    t.IAdjustmentsApplication,
    t.IAdjustmeontOperationEditStatusParams
  >({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/adjustment_requests/${p.id}/status`,
  });

  // TODO need to use IAdjustmentsApplicationForm
  const defaultAdjustmentsApplicationsForm: t.IAdjustmentsApplicationForm = {
    driver_id: undefined,
    request: "",
    comment: "",
    operation_category: null,
    operation_id: undefined,
    amount_requested: "",
    amount_type: "positive",
    status: "",
    driver_fio: "",
    // id: undefined,
    // status: "",
    // chosenStatus: "",
    // driver_id: undefined,
    // amount_type: "negative" as t.TAdjustmentsApplicationAmountType,
    // operation_category: "" as b.TBalanceOperationsCategory,
    // operation_type: "article",
    // amount_requested: 0,
    // comment: "",
    // operation_id: null,
    // request: "",
    // driver_fio: "",
    // amount_agreed: "",
  };
  const initialAdjustmentParams: t.IAdjustmeontOperationListParams = {
    driver_id: undefined,
    limit: 20,
    page: 1,
  };

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const validateOnlyNumber = (rule: any, value: any, callback: any) => {
    if (!value) {
      callback(new Error("Введите сумму"));
    } else if (!/^\d+(\.\d+)?$/.test(value)) {
      callback(new Error("Допустимы только числа"));
    } else {
      callback();
    }
  };

  const adjustmentsApplicationsRef = ref<FormInstance>();
  const adjustmentsApplicationsRules = reactive<FormRules>({
    driver_id: [
      {
        required: true,
        message: "Выберите водителя",
        trigger: "change",
      },
    ],
    // request: [{ required: true, message: "Введите ???", trigger: "blur" }],
    comment: [
      { required: true, message: "Введите комментарий", trigger: "blur" },
    ],
    operation_id: [
      {
        required: true,
        message: "Выберите операцию",
        trigger: "change",
      },
    ],
    amount_requested: [
      {
        required: true,
        message: "Выберите сумму",
        trigger: "blur",
      },
    ],
  });
  const adjustmentsApplicationsForm = ref({
    ...defaultAdjustmentsApplicationsForm,
  });
  const selectedBalanceOperation = ref<b.IBalanceOperationDetails>();
  /* const adjustmentType = ref<"article" | "operation">("article"); */

  const adjustmenstList = computed<t.IAdjustmentsApplication[]>(() => {
    return adjustmentListResponse.value?.items ?? [];
  });
  const adjustmentsListTotalItems = computed(
    () => adjustmentListResponse.value?.total_items ?? 0
  );
  const adjustmentsAmount = computed(() => {
    return adjustmentsApplicationsForm.value.amount_type == "positive"
      ? Number(adjustmentsApplicationsForm.value.amount_requested)
      : -Number(adjustmentsApplicationsForm.value.amount_requested);
  });
  const disabledForStatuses = computed(() => {
    return (
      adjustmentDetailsResult.value?.status === "done" ||
      adjustmentDetailsResult.value?.status === "rejected"
    );
  });

  watch(adjustmentDetailsResult, (v) => {
    if (v) {
      clearForm();
      const keys = Object.keys(v) as (keyof t.IAdjustmentsApplicationForm)[];
      keys.forEach((key) => {
        if (key in adjustmentsApplicationsForm.value) {
          // @ts-ignore
          adjustmentsApplicationsForm.value[key] = v[key];
        }
      });
      adjustmentsApplicationsForm.value.amount_type =
        Number(v.amount_agreed) < 0 ? "negative" : "positive";
    }
  });

  // watch(
  //   () => adjustmentsApplicationsForm.value.status,
  //   (newStatus) => {
  //     if (newStatus) {
  //       adjustmentsApplicationsForm.value.chosenStatus = newStatus;
  //     }
  //   }
  // );

  /*  watch(
    [adjustmentType, () => adjustmentsApplicationsForm.value.amount],
    () => {
      if (adjustmentType.value === "decrease") {
        adjustmentsApplicationsForm.value.amount =
          -adjustmentsApplicationsForm.value.amount;
      } else if (adjustmentType.value === "increase") {
        adjustmentsApplicationsForm.value.amount =
          adjustmentsApplicationsForm.value.amount;
      }
    }
  ); */

  const createAdjustmentApplication = async () => {
    validatePromise(adjustmentsApplicationsRef.value!).then(async () => {
      try {
        console.log(123);

        await createAdjustmentRequest({
          driver_id: adjustmentsApplicationsForm.value.driver_id!,
          operation_id: adjustmentsApplicationsForm.value.operation_id!,
          comment: adjustmentsApplicationsForm.value.comment,
          amount_requested: adjustmentsAmount.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Заявлениe на корректировку начислений добавлено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createAdjustmentError.value?.title ?? "Ошибка",
          message:
            createAdjustmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateAdjustmentApplication = async () => {
    validatePromise(adjustmentsApplicationsRef.value!).then(async () => {
      try {
        // TODO form
        await updateAdjustmentRequest({
          id: adjustmentDetailsResult.value?.id!,
          comment: adjustmentsApplicationsForm.value.comment,
          // amount_agreed: adjustmentsApplicationsForm.value.amount_agreed,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Заявлениe на корректировку начислений измененo",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateAdjustmentError.value?.title ?? "Ошибка",
          message:
            updateAdjustmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateAdjustmentApplicationStatus = async () => {
    validatePromise(adjustmentsApplicationsRef.value!).then(async () => {
      try {
        // TODO Form
        await updateAdjustmentStatusRequest({
          id: adjustmentDetailsResult.value?.id!,
          status: adjustmentsApplicationsForm.value.status!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Статус заявления на корректировку начислений изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateAdjustmentStatusError.value?.title ?? "Ошибка",
          message:
            updateAdjustmentStatusError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clearForm = () => {
    adjustmentsApplicationsForm.value = {
      ...defaultAdjustmentsApplicationsForm,
    };
    selectedBalanceOperation.value = undefined;
  };
  const getAdjustmeontOperationStatus = (
    status: t.TAdjustmeontOperationStatus
  ) => {
    switch (status) {
      case "agreed":
        return "Одобрено";
      case "done":
        return "Выполнено";
      case "pending":
        return "На рассмотрении";
      case "rejected":
        return "Отклонено";
      default:
        return "";
    }
  };

  return {
    adjustmentsApplicationsRef,
    adjustmentsApplicationsRules,
    adjustmentsApplicationsForm,
    selectedBalanceOperation,
    disabledForStatuses,
    initialAdjustmentParams,
    adjustmentsAmount,

    adjustmentsListLoading,
    adjustmenstList,
    adjustmentsListTotalItems,
    fetchAdjustmentsList,

    adjustmentDetailsLoading,
    adjustmentDetailsResult,
    fetchadjustmentDetails,

    createAdjustmentLoading,
    createAdjustmentError,
    newAdjustment,
    createAdjustmentApplication,

    updateAdjustmentResponse,
    updateAdjustmentLoading,
    updateAdjustmentError,
    updateAdjustmentApplication,

    updateAdjustmentStatusResponse,
    updateAdjustmentStatusLoading,
    updateAdjustmentStatusError,
    updateAdjustmentApplicationStatus,

    clearForm,
    getAdjustmeontOperationStatus,
  };
};

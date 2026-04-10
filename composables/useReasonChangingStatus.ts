import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, reactive, computed, watch } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";
import * as t from "@/types/reasonChangingStatus";
import type { IPagination } from "@/types/apiDefault";

export const useReasonChangingStatus = () => {
  const {
    loading: reasonChangingStatusListLoading,
    response: reasonChangingStatusResp,
    request: fetchReasonChangingStatusList,
  } = useApi<
    IPagination<t.IReasonChangingStatus>,
    t.IReasonChangingStatusListParams
  >({
    url: "/api/v1/reasons_changing_status",
    method: "GET",
  });
  const {
    loading: reasonChangingStatusDetailsLoading,
    response: reasonChangingStatusDetailsResult,
    request: fetchReasonChangingStatusDetails,
  } = useApi<t.IReasonChangingStatus, t.IReasonChangingStatusDetailParams>({
    dynamicUrl: (p) => `/api/v1/reasons_changing_status/${p.reason_id}`,
    method: "GET",
  });
  const {
    loading: createReasonChangingStatusLoading,
    error: creatReasonChangingStatusError,
    response: newReasonChangingStatus,
    request: createReasonChangingStatusRequest,
  } = useApi<t.IReasonChangingStatus, t.IReasonChangingStatusForm>({
    url: "/api/v1/reasons_changing_status",
    method: "POST",
  });
  const {
    loading: editReasonChangingStatusLoading,
    error: editReasonChangingStatusError,
    response: editReasonChangingStatusResult,
    request: editReasonChangingStatusRequest,
  } = useApi<string, t.IReasonChangingStatusEditParams>({
    dynamicUrl: (p) => `/api/v1/reasons_changing_status/${p.reason_id}`,
    method: "PUT",
  });
  const {
    loading: deleteReasonChangingStatusLoading,
    error: deleteReasonChangingStatusError,
    response: deleteReasonChangingStatusResult,
    request: deleteReasonChangingStatusRequest,
  } = useApi<string, t.IReasonChangingStatusDetailParams>({
    dynamicUrl: (p) => `/api/v1/reasons_changing_status/${p.reason_id}`,
    method: "DELETE",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const emptyPageFilters = {
    search: "",
    page: 1,
    limit: 20,
  };
  const emptyStatusReasonForm: t.IReasonChangingStatusForm = {
    name: "",
  };
  const statusReasonRef = ref<FormInstance>();
  const statusReasonRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование",
        trigger: "blur",
      },
    ],
  });
  const statusReasonForm = ref({ ...emptyStatusReasonForm });

  const reasonChangingList = computed<t.IReasonChangingStatus[]>(() => {
    return reasonChangingStatusResp.value?.items ?? [];
  });
  const reasonChangingListTotalItems = computed(
    () => reasonChangingStatusResp.value?.total_items ?? 0
  );

  watch(reasonChangingStatusDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IReasonChangingStatusForm)[];
      keys.forEach((key) => {
        if (key in statusReasonForm.value) {
          // @ts-ignore
          statusReasonForm.value[key] = v[key];
        }
      });
    }
  });

  const createStatusReason = async () => {
    validatePromise(statusReasonRef.value!).then(async () => {
      try {
        await createReasonChangingStatusRequest({
          ...statusReasonForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Причина увольнения добавлена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: creatReasonChangingStatusError.value?.title ?? "Ошибка",
          message:
            creatReasonChangingStatusError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const editStatusReason = async () => {
    validatePromise(statusReasonRef.value!).then(async () => {
      try {
        await editReasonChangingStatusRequest({
          ...statusReasonForm.value,
          reason_id: reasonChangingStatusDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Причина увольнения измененa",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editReasonChangingStatusError.value?.title ?? "Ошибка",
          message:
            editReasonChangingStatusError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteStatusReason = async (id: number): Promise<void> => {
    try {
      await deleteReasonChangingStatusRequest({
        reason_id: id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Причина увольнения удаленa",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteReasonChangingStatusError.value?.title ?? "Ошибка",
        message:
          deleteReasonChangingStatusError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const clearForm = () => {
    statusReasonForm.value = { ...emptyStatusReasonForm };
  };

  return {
    statusReasonRef,
    statusReasonRules,
    statusReasonForm,

    emptyPageFilters,
    reasonChangingList,
    reasonChangingListTotalItems,
    reasonChangingStatusListLoading,
    fetchReasonChangingStatusList,

    reasonChangingStatusDetailsLoading,
    reasonChangingStatusDetailsResult,
    fetchReasonChangingStatusDetails,

    createReasonChangingStatusLoading,
    newReasonChangingStatus,
    createStatusReason,

    editReasonChangingStatusLoading,
    editReasonChangingStatusResult,
    editStatusReason,

    deleteReasonChangingStatusLoading,
    deleteReasonChangingStatusResult,
    deleteStatusReason,

    clearForm,
  };
};

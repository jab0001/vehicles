import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, watch, computed } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/checkExtra";

export const useCheckExtra = () => {
  const {
    loading: checkExtraListLoading,
    response: checkExtraResponse,
    request: fetchCheckExtraList, // TODO backend search param, pagination
  } = useApi<{ items: t.ICheckExtra[]; total_items: number }>({
    url: "/api/v1/check",
    method: "GET",
  });
  const {
    loading: checkExtraHistoryListLoading,
    response: checkExtraHistoryResponse,
    request: fetchCheckExtraHistoryList, // TODO backend search param, pagination
  } = useApi<{ items: t.ICheckExtra[]; total_items: number }>({
    url: "/api/v1/check",
    method: "GET",
  });
  const {
    loading: partyGroupsListLoading,
    response: partyGroupsResponse,
    request: fetchPartyGroupsList,
  } = useApi<string[]>({
    url: "/api/v1/check/part_groups",
    method: "GET",
  });
  const {
    loading: createCheckExtraLoading,
    error: createCheckExtraError,
    response: newCheckExtra,
    request: createCheckExtraRequest,
  } = useApi<t.ICheckExtra>({
    dynamicUrl: (p) => `/api/v1/check`,
    method: "POST",
  });
  const {
    loading: editCheckExtraLoading,
    error: editCheckExtraError,
    response: editCheckExtraResult,
    request: editCheckExtraRequest,
  } = useApi<t.ICheckExtra>({
    dynamicUrl: (p) => `/api/v1/check/${p.check_extra_id}`,
    method: "PUT",
  });

  const {
    loading: deleteCheckExtraLoading,
    error: deleteCheckExtraError,
    response: deleteCheckExtraResult,
    request: deleteCheckExtraRequest,
  } = useApi<t.ICheckExtraDetailParams>({
    dynamicUrl: (p) => `/api/v1/check/${p.check_extra_id}`,
    method: "DELETE",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const emptyPageFilters = {
    search: undefined,
    page: 1,
    limit: 20,
  };
  const pageFilters = ref({
    ...emptyPageFilters,
  });
  const emptyCheckExtraForm: t.ICheckExtraForm = {
    inspection_types: [],
    part_group: "",
    choice_accrual: true,
    choice_default: true,
    name: "",
    extra_field: null,
    amount: 0,
  };

  const checkExtraRef = ref<FormInstance>();
  const checkExtraForm = ref({ ...emptyCheckExtraForm });

  const checkExtraRules = computed<FormRules>(() => {
    return {
      name: [
        { required: true, message: "Введите наименование", trigger: "blur" },
      ],
      extra_field: [
        { required: true, message: "Введите наименование", trigger: "blur" },
      ],
    };
  });

  const clearFilters = () => {
    pageFilters.value = { ...emptyPageFilters, search: undefined };
  };

  const clearForm = () => {
    checkExtraForm.value = {
      ...emptyCheckExtraForm,
    };
  };

  const getCheckExtraList = async () => {
    try {
      await fetchCheckExtraList({
        ...pageFilters.value,
      });
    } catch (e) {
      console.error({ e });
    }
  };

  const checkExtraList = computed<t.ICheckExtra[]>(() => {
    return checkExtraResponse.value?.items ?? [];
  });

  const checkExtraHistoryList = computed<t.ICheckExtra[]>(() => {
    return checkExtraHistoryResponse.value?.items ?? [];
  });

  const checkExtraListTotalItems = computed(
    () => checkExtraResponse.value?.total_items ?? 0
  );

  const createCheckExtra = async () => {
    validatePromise(checkExtraRef.value!).then(async () => {
      try {
        await createCheckExtraRequest({
          ...checkExtraForm.value,
        });
        hideDrawer();
        clearForm();
        ElNotification({
          title: "Успешный запрос",
          message: "Новый пункт чек-листа добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createCheckExtraError.value?.title ?? "Ошибка",
          message:
            createCheckExtraError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const editCheckExtra = async (check_extra_id: string) => {
    validatePromise(checkExtraRef.value!).then(async () => {
      try {
        await editCheckExtraRequest({
          ...checkExtraForm.value,
          check_extra_id,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Пункт чек-листа изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editCheckExtraError.value?.title ?? "Ошибка",
          message:
            editCheckExtraError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const deleteCheckExtra = async (id: number): Promise<void> => {
    try {
      await deleteCheckExtraRequest({
        check_extra_id: id,
      });
      await fetchCheckExtraList({
        ...pageFilters.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Пункт чек-листа успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteCheckExtraError.value?.title ?? "Ошибка",
        message:
          deleteCheckExtraError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getCheckExtraById = (id: string | number) => {
    return checkExtraList.value?.find((r) => r.id === Number(id));
  };

  const partGroups = computed(() => {
    return partyGroupsResponse.value ?? [];
  });

  return {
    checkExtraRef,
    checkExtraRules,
    checkExtraForm,
    pageFilters,
    emptyPageFilters,

    checkExtraListLoading,
    checkExtraList,
    checkExtraHistoryList,
    checkExtraListTotalItems,
    fetchCheckExtraList,
    fetchCheckExtraHistoryList,
    getCheckExtraList,
    getCheckExtraById,
    fetchPartyGroupsList,
    partyGroupsListLoading,
    partGroups,

    clearFilters,
    clearForm,

    createCheckExtraLoading,
    createCheckExtraError,
    newCheckExtra,
    createCheckExtra,

    editCheckExtraLoading,
    editCheckExtraError,
    editCheckExtraResult,
    editCheckExtra,

    deleteCheckExtraLoading,
    deleteCheckExtra,
  };
};

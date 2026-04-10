import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, reactive, watch, computed } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/conditions";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";

const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

export const useConditions = () => {
  const {
    loading: conditionsListLoading,
    response: conditionsResponse,
    request: fetchConditionsList,
  } = useApi<{ items: t.ICondition[]; total_items: number }>({
    url: "/api/v1/working_shift/condition",
    method: "GET",
  });
  const {
    loading: conditionDetailsLoading,
    response: conditionDetailsResult,
    request: fetchConditionDetails,
  } = useApi<t.ICondition>({
    dynamicUrl: (p) => `/api/v1/working_shift/condition/${p.condition_id}`,
    method: "GET",
  });
  const {
    loading: createConditionLoading,
    error: createConditionError,
    response: newCondition,
    request: createConditionRequest,
  } = useApi<t.ICondition>({
    dynamicUrl: (p) => `/api/v1/working_shift/condition`,
    method: "POST",
  });
  const {
    loading: editConditionLoading,
    error: editConditionError,
    response: editConditionResult,
    request: editConditionRequest,
  } = useApi<t.ICondition>({
    dynamicUrl: (p) => `/api/v1/working_shift/condition/${p.condition_id}`,
    method: "PUT",
  });

  const {
    loading: deleteConditionLoading,
    error: deleteConditionError,
    response: deleteConditionResult,
    request: deleteConditionRequest,
  } = useApi<t.IConditionDetailsParams>({
    dynamicUrl: (p) => `/api/v1/working_shift/condition/${p.condition_id}`,
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
  const emptyConditionsForm: t.IConditionForm = {
    name: "",
    use_net_earnings: false,
    rules: [
      {
        income_upper_limit: 1,
        rate: null,
        rate_per_hour: null,
        income_percent: null,
      },
    ],
  };

  const conditionsRef = ref<FormInstance>();
  const conditionsForm = ref({ ...emptyConditionsForm });

  const conditionsRules = computed<FormRules>(() => {
    return {
      name: [
        { required: true, message: "Введите наименование", trigger: "blur" },
      ],
    };
  });

  const clearFilters = () => {
    pageFilters.value = { ...emptyPageFilters, search: undefined };
  };

  const clearForm = () => {
    conditionsForm.value = {
      ...emptyConditionsForm,
      rules: [
        {
          income_upper_limit: 1,
          rate: null,
          rate_per_hour: null,
          income_percent: null,
        },
      ],
    };
  };

  watch(conditionDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IConditionForm)[];
      keys.forEach((key) => {
        if (key in conditionsForm.value) {
          // @ts-ignore
          conditionsForm.value[key] = v[key];
        }
      });
    }
  });

  const conditionsList = computed<t.ICondition[]>(() => {
    return conditionsResponse.value?.items ?? [];
  });

  const conditionsListTotalItems = computed(
    () => conditionsResponse.value?.total_items ?? 0
  );

  const createCondition = async () => {
    validatePromise(conditionsRef.value!).then(async () => {
      try {
        await createConditionRequest({
          ...conditionsForm.value,
          company_id: currentCompanyId.value,
        });
        hideDrawer();
        clearForm();
        ElNotification({
          title: "Успешный запрос",
          message: "Условие добавлено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createConditionError.value?.title ?? "Ошибка",
          message:
            createConditionError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const editCondition = async () => {
    validatePromise(conditionsRef.value!).then(async () => {
      try {
        await editConditionRequest({
          ...conditionsForm.value,
          condition_id: conditionDetailsResult.value?.id,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Условие изменено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editConditionError.value?.title ?? "Ошибка",
          message:
            editConditionError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const deleteCondition = async (id: number): Promise<void> => {
    try {
      await deleteConditionRequest({
        condition_id: id,
      });
      await fetchConditionsList({
        ...pageFilters.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Условие успешно удалено",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteConditionError.value?.title ?? "Ошибка",
        message:
          deleteConditionError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  return {
    conditionsRef,
    conditionsRules,
    conditionsForm,
    pageFilters,
    emptyPageFilters,

    conditionsListLoading,
    conditionsList,
    conditionsListTotalItems,
    fetchConditionsList,

    clearFilters,
    clearForm,

    conditionDetailsLoading,
    conditionDetailsResult,
    fetchConditionDetails,

    createConditionLoading,
    createConditionError,
    newCondition,
    createCondition,

    editConditionLoading,
    editConditionError,
    editConditionResult,
    editCondition,

    deleteConditionLoading,
    deleteConditionError,
    deleteConditionResult,
    deleteCondition,
  };
};

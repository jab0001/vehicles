import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, reactive, watch, computed } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/inspectionsSchedule";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";

const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

export const useInspectionsSchedule = () => {
  const {
    loading: inspectionsScheduleListLoading,
    response: inspectionsSchedule,
    request: fetchInspectionsScheduleList, // TODO backend search param, pagination
  } = useApi<{ items: t.IInspectionsSchedule[]; total_items: number }>({
    url: "/api/v1/technical_inspections/schedules",
    method: "GET",
  });
  const {
    loading: inspectionsScheduleDetailsLoading,
    response: inspectionsScheduleDetailsResult,
    request: fetchInspectionsScheduleDetails,
  } = useApi<t.IInspectionsSchedule[]>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/schedules/${p.schedule_id}`,
    method: "GET",
  });
  const {
    loading: createInspectionsScheduleLoading,
    error: createInspectionsScheduleError,
    response: newInspectionsSchedule,
    request: createInspectionsScheduleRequest,
  } = useApi<t.IInspectionsSchedule>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/schedules?company_id=${p.company_id}`,
    method: "POST",
  });
  const {
    loading: editInspectionsScheduleLoading,
    error: editInspectionsScheduleError,
    response: editInspectionsScheduleResult,
    request: editInspectionsScheduleRequest,
  } = useApi<t.IInspectionsSchedule>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/schedules/${p.schedule_id}?company_id=${p.company_id}`,
    method: "PATCH",
  });

  const {
    loading: deleteInspectionsScheduleLoading,
    error: deleteInspectionsScheduleError,
    response: deleteInspectionsScheduleResult,
    request: deleteInspectionsScheduleRequest,
  } = useApi<t.IInspectionsScheduleDetailsParams>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/schedules/${p.schedule_id}?company_id=${p.company_id}`,
    method: "DELETE",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const emptyPageFilters = {
    name: undefined,
    page: 1,
    limit: 20,
  };
  const pageFilters = ref({
    ...emptyPageFilters,
  });
  const emptyInstectionsScheduleForm: t.IInspectionsScheduleForm = {
    name: "",
    company_id: undefined,
    schedule: [
      {
        mileage: 0,
        comment: "",
      },
    ],
    extra_info: "",
    vehicle_brand: undefined,
    vehicle_model: undefined,
  };

  const inspectionsScheduleRef = ref<FormInstance>();
  const inspectionsScheduleForm = ref({ ...emptyInstectionsScheduleForm });

  watch(
    () => inspectionsScheduleForm.value.schedule,
    () => {
      if (inspectionsScheduleRef.value) {
        inspectionsScheduleRef.value.clearValidate();
      }
    },
    { deep: true }
  );

  const validateInspectionDistance = (rule: any, value: any, callback: any) => {
    const index = Number(rule.field.split(".")[1]);

    if (!value || isNaN(value)) {
      callback(new Error("Введите корректное число"));
    } else if (
      index > 0 &&
      value <= inspectionsScheduleForm.value.schedule[index - 1].mileage
    ) {
      callback(new Error("Значение должно быть больше предыдущего"));
    } else {
      callback();
    }
  };

  const inspectionsScheduleRules = computed<FormRules>(() => {
    return {
      name: [
        { required: true, message: "Введите наименование", trigger: "blur" },
      ],
      vehicle_brand: [
        { required: true, message: "Выберите марку", trigger: "change" },
      ],
      ...inspectionsScheduleForm.value.schedule.reduce((rules, _, index) => {
        rules[`schedule.${index}.mileage`] = [
          {
            required: true,
            validator: validateInspectionDistance,
            trigger: "blur",
          },
        ];
        return rules;
      }, {} as FormRules),
    };
  });

  const clearFilters = () => {
    pageFilters.value = { ...emptyPageFilters, name: undefined };
  };

  const clearForm = () => {
    inspectionsScheduleForm.value = {
      ...emptyInstectionsScheduleForm,
      schedule: [
        {
          mileage: 0,
          comment: "",
        },
      ],
    };
  };

  watch(inspectionsScheduleDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IInspectionsScheduleForm)[];
      keys.forEach((key) => {
        if (key in inspectionsScheduleForm.value) {
          // @ts-ignore
          inspectionsScheduleForm.value[key] = v[key];
        }
      });
    }
  });

  const inspectionsScheduleList = computed<t.IInspectionsSchedule[]>(() => {
    return inspectionsSchedule.value?.items ?? [];
  });

  const inspectionsScheduleListTotalItems = computed(
    () => inspectionsSchedule.value?.total_items ?? 0
  );

  const createInspectionsSchedule = async () => {
    validatePromise(inspectionsScheduleRef.value!).then(async () => {
      try {
        await createInspectionsScheduleRequest({
          ...inspectionsScheduleForm.value,
          company_id: currentCompanyId.value,
        });
        hideDrawer();
        clearForm();
        ElNotification({
          title: "Успешный запрос",
          message: "Шаблон ТО добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createInspectionsScheduleError.value?.title ?? "Ошибка",
          message:
            createInspectionsScheduleError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const editInspectionsSchedule = async () => {
    validatePromise(inspectionsScheduleRef.value!).then(async () => {
      try {
        await editInspectionsScheduleRequest({
          ...inspectionsScheduleForm.value,
          schedule_id: inspectionsScheduleDetailsResult.value?.id,
          company_id: currentCompanyId.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Шаблон ТО изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editInspectionsScheduleError.value?.title ?? "Ошибка",
          message:
            editInspectionsScheduleError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const deleteInspectionsSchedule = async (id: number): Promise<void> => {
    try {
      await deleteInspectionsScheduleRequest({
        schedule_id: id,
        company_id: currentCompanyId.value,
      });
      await fetchInspectionsScheduleList({
        ...pageFilters.value,
        company_id: currentCompanyId.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Шаблон ТО успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteInspectionsScheduleError.value?.title ?? "Ошибка",
        message:
          deleteInspectionsScheduleError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  return {
    inspectionsScheduleRef,
    inspectionsScheduleRules,
    inspectionsScheduleForm,
    pageFilters,
    emptyPageFilters,

    inspectionsScheduleListLoading,
    inspectionsScheduleList,
    inspectionsScheduleListTotalItems,
    fetchInspectionsScheduleList,

    clearFilters,
    clearForm,

    inspectionsScheduleDetailsLoading,
    inspectionsScheduleDetailsResult,
    fetchInspectionsScheduleDetails,

    createInspectionsScheduleLoading,
    createInspectionsScheduleError,
    newInspectionsSchedule,
    createInspectionsSchedule,

    editInspectionsScheduleLoading,
    editInspectionsScheduleError,
    editInspectionsScheduleResult,
    editInspectionsSchedule,

    deleteInspectionsScheduleLoading,
    deleteInspectionsSchedule,
  };
};

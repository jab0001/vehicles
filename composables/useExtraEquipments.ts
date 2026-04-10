import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, reactive, watch } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/extraEquipments";

export const useExtraEquipments = () => {
  const {
    loading: extraEquipmentsListLoading,
    response: extraEquipments,
    request: fetchExtraEquipmentsList, // TODO backend search param, pagination
  } = useApi<t.IExtraEquipment[]>({
    url: "/api/v1/extra_equipment",
    method: "GET",
  });
  const {
    loading: extraEquipDetailsLoading,
    response: extraEquipDetailsResult,
    request: fetchextraEquipDetails,
  } = useApi<t.IExtraEquipment, t.IExtraEquipmentDetailsParams>({
    dynamicUrl: (p) => `/api/v1/extra_equipment${p.equipment_id}`,
    method: "GET",
  });
  const {
    loading: createExtraEquipmentLoading,
    error: creatEextraEquipmentError,
    response: newExtraEquipment,
    request: createExtraEquipmentRequest,
  } = useApi<t.IExtraEquipment, t.IExtraEquipmentForm>({
    url: "/api/v1/extra_equipment",
    method: "POST",
  });
  const {
    loading: editExtraEquipmentLoading,
    error: editextraEquipmentError,
    response: editExtraEquipmentResult,
    request: editExtraEquipmentRequest,
  } = useApi<t.IExtraEquipment, t.IExtraEquipmentEditParams>({
    dynamicUrl: (p) => `/api/v1/extra_equipment?equipment_id=${p.equipment_id}`,
    method: "PATCH",
  });
  const {
    loading: deleteExtraEquipmentLoading,
    error: deleteextraEquipmentError,
    response: deleteExtraEquipmentResult,
    request: deleteExtraEquipmentRequest,
  } = useApi<string, t.IExtraEquipmentDetailsParams>({
    dynamicUrl: (p) => `/api/v1/extra_equipment/disable/${p.equipment_id}`,
    method: "POST",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const emptyPageFilters = {
    search: "",
    page: 1,
    limit: 20,
  };
  const pageFilters = ref({
    ...emptyPageFilters,
  });
  const emptyExtraEquipForm: t.IExtraEquipmentForm = {
    name: "",
    price: "",
    charge_at: "",
  };
  const extraEquipRef = ref<FormInstance>();
  const extraEquipRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование",
        trigger: "blur",
      },
    ],
    price: [
      {
        required: true,
        message: "Введите цену",
        trigger: "blur",
      },
    ],
    charge_at: [
      {
        required: true,
        message: "Выберите период",
        trigger: "change",
      },
    ],
  });
  const extraEquipForm = ref({ ...emptyExtraEquipForm });

  watch(extraEquipDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IExtraEquipmentForm)[];
      keys.forEach((key) => {
        if (key in extraEquipForm.value) {
          // @ts-ignore
          extraEquipForm.value[key] = v[key];
        }
      });
    }
  });

  const createExtraEquip = async () => {
    validatePromise(extraEquipRef.value!).then(async () => {
      try {
        await createExtraEquipmentRequest({
          ...extraEquipForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Доп. начисление добавлено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: creatEextraEquipmentError.value?.title ?? "Ошибка",
          message:
            creatEextraEquipmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const editExtraEquip = async () => {
    validatePromise(extraEquipRef.value!).then(async () => {
      try {
        await editExtraEquipmentRequest({
          ...extraEquipForm.value,
          equipment_id: extraEquipDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Доп. начисление изменено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: creatEextraEquipmentError.value?.title ?? "Ошибка",
          message:
            creatEextraEquipmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteExtraEquip = async (id: number): Promise<void> => {
    try {
      await deleteExtraEquipmentRequest({
        equipment_id: id,
      });
      await fetchExtraEquipmentsList({
        ...pageFilters.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Доп. начисление успешно удалено",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteextraEquipmentError.value?.title ?? "Ошибка",
        message:
          deleteextraEquipmentError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const clearForm = () => {
    extraEquipForm.value = { ...emptyExtraEquipForm };
  };
  const clearFilters = () => {
    pageFilters.value = { ...emptyPageFilters };
  };

  const getExtraEquipChargeAt = (v: t.TExtraEquipmentCharge) => {
    switch (v) {
      case "all_days":
        return "Все дни";
      case "weekend_days":
        return "Выходные";
      case "work_days":
        return "Рабочие дни";
      default:
        return "";
    }
  };

  return {
    extraEquipRef,
    extraEquipRules,
    extraEquipForm,
    pageFilters,
    clearForm,
    clearFilters,

    extraEquipmentsListLoading,
    extraEquipments,
    fetchExtraEquipmentsList,

    createExtraEquipmentLoading,
    creatEextraEquipmentError,
    newExtraEquipment,
    createExtraEquip,

    editExtraEquipmentLoading,
    editextraEquipmentError,
    editExtraEquipmentResult,
    editExtraEquip,

    extraEquipDetailsLoading,
    extraEquipDetailsResult,
    fetchextraEquipDetails,

    deleteExtraEquipmentLoading,
    deleteExtraEquip,

    getExtraEquipChargeAt,
  };
};

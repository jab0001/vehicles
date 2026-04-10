import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { ref, watch, computed } from "vue";
import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";

import * as t from "@/types/equipment";

export const useEquipment = () => {
  const {
    loading: equipmentListLoading,
    response: equipmentResponse,
    request: fetchEquipmentList, // TODO backend search param, pagination
  } = useApi<{ items: t.IEquipment[]; total_items: number }>({
    url: "/api/v1/equipment",
    method: "GET",
  });
  const {
    loading: equipmentHistoryListLoading,
    response: equipmentHistoryResponse,
    request: fetchEquipmentListHistory,
  } = useApi<{ items: t.IEquipment[]; total_items: number }>({
    url: "/api/v1/equipment",
    method: "GET",
  });
  const {
    loading: createEquipmentLoading,
    error: createEquipmentError,
    response: newEquipment,
    request: createEquipmentRequest,
  } = useApi<t.IEquipment>({
    dynamicUrl: (p) =>
      `/api/v1/equipment`,
    method: "POST",
  });
  const {
    loading: editEquipmentLoading,
    error: editEquipmentError,
    response: editEquipmentResult,
    request: editEquipmentRequest,
  } = useApi<t.IEquipment>({
    dynamicUrl: (p) =>
      `/api/v1/equipment/${p.template_id}`,
    method: "PUT",
  });

  const {
    loading: deleteEquipmentLoading,
    error: deleteEquipmentError,
    response: deleteEquipmentResult,
    request: deleteEquipmentRequest,
  } = useApi<t.IEquipmentDetailParams>({
    dynamicUrl: (p) =>
      `/api/v1/equipment/${p.template_id}`,
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
  const emptyEquipmentForm: t.IEquipmentForm = {
    name: "",
    lost_cost: ""
  };

  const equipmentRef = ref<FormInstance>();
  const equipmentForm = ref({ ...emptyEquipmentForm });


  const equipmentRules = computed<FormRules>(() => {
    return {
      name: [
        { required: true, message: "Введите наименование", trigger: "blur" },
      ],
      lost_cost: [
        { required: true, message: "Введите стоимость утраты", trigger: "change" },
      ],
    };
  });

  const clearFilters = () => {
    pageFilters.value = { ...emptyPageFilters, search: undefined };
  };

  const clearForm = () => {
    equipmentForm.value = {
      ...emptyEquipmentForm,
    };
  };

  const getEquipmentList = async () => {
    try {
      await fetchEquipmentList({
        ...pageFilters.value,
      });
    } catch (e) {
      console.error({ e });
    }
  };

  const equipmentList = computed<t.IEquipment[]>(() => {
    return equipmentResponse.value?.items ?? [];
  });

  const equipmentHistoryList = computed<t.IEquipment[]>(() => {
    return equipmentHistoryResponse.value?.items ?? [];
  });

  const equipmentListTotalItems = computed(
    () => equipmentResponse.value?.total_items ?? 0
  );

  const createEquipment = async () => {
    validatePromise(equipmentRef.value!).then(async () => {
      try {
        await createEquipmentRequest({
          ...equipmentForm.value,
        });
        hideDrawer();
        clearForm();
        ElNotification({
          title: "Успешный запрос",
          message: "Новый элемент комплектации добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createEquipmentError.value?.title ?? "Ошибка",
          message:
            createEquipmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const editEquipment = async (template_id: string) => {
    validatePromise(equipmentRef.value!).then(async () => {
      try {
        await editEquipmentRequest({
          ...equipmentForm.value,
          template_id
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Элемент комплектации изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: editEquipmentError.value?.title ?? "Ошибка",
          message:
            editEquipmentError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const deleteEquipment = async (id: number): Promise<void> => {
    try {
      await deleteEquipmentRequest({
        template_id: id
      });
      await fetchEquipmentList({
        ...pageFilters.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Элемент комплектации успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteEquipmentError.value?.title ?? "Ошибка",
        message:
          deleteEquipmentError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getEquipmentById = (id: string | number) => {
    return equipmentList.value?.find((r) => r.id === Number(id));
  };

  return {
    equipmentRef,
    equipmentRules,
    equipmentForm,
    pageFilters,
    emptyPageFilters,

    equipmentListLoading,
    equipmentList,
    equipmentHistoryList,
    equipmentListTotalItems,
    fetchEquipmentList,
    fetchEquipmentListHistory,
    getEquipmentList,
    getEquipmentById,

    clearFilters,
    clearForm,

    createEquipmentLoading,
    createEquipmentError,
    newEquipment,
    createEquipment,

    editEquipmentLoading,
    editEquipmentError,
    editEquipmentResult,
    editEquipment,

    deleteEquipmentLoading,
    deleteEquipment,
  };
};

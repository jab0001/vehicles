import { computed, ref, reactive, watch } from "vue";
import {
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

import * as t from "@/types/damages";
import type { IPagination } from "@/types/apiDefault";

export const useDamages = () => {
  const {
    loading: damagesListLoading,
    response: damagesResponse,
    request: fetchDamagesList,
  } = useApi<IPagination<t.IDamage>, t.IDamagesListParams>({
    url: "/api/v1/damage",
    method: "GET",
  });
  const {
    loading: damageDetailsLoading,
    response: damageDetailsResult,
    request: fetchDamageDetails,
  } = useApi<t.IDamage, t.IDamageDetailsParams>({
    dynamicUrl: (p) => `/api/v1/damage/${p.damage_id}`,
    method: "GET",
  });
  const {
    loading: createDamageLoading,
    error: createDamageError,
    response: newDamage,
    request: createDamageRequest,
  } = useApi<t.IDamage, t.IDamageForm>({
    url: "/api/v1/damage",
    method: "POST",
  });
  const {
    loading: createDamageFromInspectionLoading,
    error: createDamageFromInspectionError,
    response: newDamageFromInspection,
    request: createDamageFromInspectionRequest,
  } = useApi<t.IDamage, { inspection_id: number }>({
    dynamicUrl: (p) => `/api/v1/damage/inspection/${p.inspection_id}`,
    method: "POST",
  });
  const {
    response: updateDamageResponse,
    loading: updateDamageLoading,
    request: updateDamageRequest,
    error: updateDamageError,
  } = useApi<t.IDamage, t.IDamageEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/damage/${p.id}`,
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const initialDamagesParams: t.IDamagesListParams = {
    search: "",
    order_by: "created_at",
    direction: "desc",
    limit: 20,
    page: 1,
  };
  const emptyDamageForm: t.IDamageForm = {
    status: "",
    vehicle_id: null,
    cost: "",
    payed_sum: "",
    driver_id: null,
    damage_type: "",
    reason: "",
    place: "",
    culprit: "",
    event_time: "",
    certificate_number: "",
    certificate_date: "",
    files: [],
    damage: "", // добавить в компонент формы (непонятное поле)
  };

  const damagesRef = ref<FormInstance>();
  const damagesRules = reactive<FormRules>({
    // certificate_number: [
    //   { required: true, message: "Введите № сертификата", trigger: "blur" },
    // ],
    // certificate_date: [
    //   {
    //     required: true,
    //     message: "Введите дату сертификата",
    //     trigger: "change",
    //   },
    // ],
    status: [
      {
        required: true,
        message: "Выберите Статус",
        trigger: "change",
      },
    ],
    cost: [
      { required: true, message: "Введите cуммy ущерба", trigger: "blur" },
    ],
    payed_sum: [
      {
        required: true,
        message: "Введите cуммy зачтенную сумма",
        trigger: "blur",
      },
    ],
    culprit: [
      {
        required: true,
        message: "Выберите виновникa ущерба",
        trigger: "change",
      },
    ],
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    damage_type: [
      {
        required: true,
        message: "Выберите тип ущерба",
        trigger: "change",
      },
    ],
    event_time: [
      {
        required: true,
        message: "Введите время и дату ущерба",
        trigger: "change",
      },
    ],
    // files: [
    //   {
    //     required: true,
    //     message: "Приложите фотографии ущерба",
    //     trigger: "change",
    //   },
    // ],
  });
  const damageForm = ref({
    ...emptyDamageForm,
  });

  const damagesList = computed<t.IDamage[]>(() => {
    return damagesResponse.value?.items ?? [];
  });
  const damagesListTotalItems = computed(
    () => damagesResponse.value?.total_items ?? 0
  );

  watch(damageDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IDamageForm)[];
      keys.forEach((key) => {
        if (key in damageForm.value) {
          // @ts-ignore
          damageForm.value[key] = v[key];
        }
      });
    }
  });

  const createDamage = async (): Promise<void> => {
    validatePromise(damagesRef.value!).then(async () => {
      try {
        await createDamageRequest({
          ...damageForm.value,
          certificate_date: formatDateToServer(
            damageForm.value.certificate_date
          )!,
          event_time: formatDateTimeToServer(damageForm.value.event_time)!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Ущерб добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createDamageError.value?.title ?? "Ошибка",
          message:
            createDamageError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const createDamageFromInspection = async (
    inspection_id: number
  ): Promise<void> => {
    try {
      await createDamageFromInspectionRequest({
        inspection_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Ущерб добавлен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createDamageFromInspectionError.value?.title ?? "Ошибка",
        message:
          createDamageFromInspectionError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };
  const updateDamage = async (): Promise<void> => {
    validatePromise(damagesRef.value!).then(async () => {
      try {
        await updateDamageRequest({
          id: damageDetailsResult.value?.id!,
          ...damageForm.value,
          certificate_date: formatDateToServer(
            damageForm.value.certificate_date
          )!,
          event_time: formatDateTimeToServer(damageForm.value.event_time)!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Ущерб изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateDamageError.value?.title ?? "Ошибка",
          message:
            updateDamageError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clearForm = () => {
    damageForm.value = { ...emptyDamageForm };
  };
  const getDamageStatus = (status: t.TDamageStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return "В процессе";
      case "DONE":
        return "Завершен";
      default:
        return "";
    }
  };
  const getDamageCulprit = (status: t.TDamageCulprit) => {
    switch (status) {
      case "NOT_DEFINED":
        return "Не определено";
      case "DRIVER":
        return "Водитель";
      case "THIRD_PARTY":
        return " Третье лицо";
      case "MUTUAL":
        return "Обоюдное";
      default:
        return "";
    }
  };
  const getDamageType = (status: t.TDamageType) => {
    switch (status) {
      case "DAMAGE":
        return "Повреждение";
      case "EUROPROTOCOL":
        return "Европротокол";
      case "ACCIDENT":
        return "ДТП";
      case "INSPECTION":
        return "Выявленный ущерб при осмотре";
      default:
        return "";
    }
  };

  const damageCulprits: { key: t.TDamageCulprit; label: string }[] = [
    { key: "NOT_DEFINED", label: getDamageCulprit("NOT_DEFINED") },
    { key: "DRIVER", label: getDamageCulprit("DRIVER") },
    {
      key: "THIRD_PARTY",
      label: getDamageCulprit("THIRD_PARTY"),
    },
    { key: "MUTUAL", label: getDamageCulprit("MUTUAL") },
  ];
  const damageTypes: { key: t.TDamageType; label: string }[] = [
    { key: "DAMAGE", label: getDamageType("DAMAGE") },
    { key: "EUROPROTOCOL", label: getDamageType("EUROPROTOCOL") },
    {
      key: "ACCIDENT",
      label: getDamageType("ACCIDENT"),
    },
    { key: "INSPECTION", label: getDamageType("INSPECTION") },
  ];
  const damageStatuses: { key: t.TDamageStatus; label: string }[] = [
    { key: "IN_PROGRESS", label: getDamageStatus("IN_PROGRESS") },
    { key: "DONE", label: getDamageStatus("DONE") },
  ];

  return {
    damagesList,
    damagesListTotalItems,
    damagesListLoading,
    fetchDamagesList,

    damageDetailsLoading,
    damageDetailsResult,
    fetchDamageDetails,

    createDamageLoading,
    createDamageError,
    newDamage,
    newDamageFromInspection,
    createDamage,
    createDamageFromInspection,

    updateDamageResponse,
    updateDamageLoading,
    updateDamageError,
    updateDamage,

    initialDamagesParams,
    damageForm,
    damagesRef,
    damagesRules,
    clearForm,
    getDamageStatus,
    getDamageCulprit,
    getDamageType,
    damageStatuses,
    damageTypes,
    damageCulprits
  };
};

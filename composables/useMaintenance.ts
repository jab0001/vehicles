import { computed, ref, reactive, watch } from "vue";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { storeToRefs } from "pinia";

import useApi from "@/composables/useApi";
import { useAppStore } from "@/stores/appStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useHelpers } from "./useHelpers";
import * as t from "@/types/maintenance";
import type { IPagination } from "@/types/apiDefault";

export const useMaintenance = () => {
  const {
    loading: maintenanceListLoading,
    response: maintenanceResponse,
    request: fetchMaintenanceList,
  } = useApi<IPagination<t.IMaintenance>, t.IMaintenanceListParams>({
    url: "/api/v1/technical_inspections",
    method: "GET",
  });
  const {
    loading: maintenanceDetailsLoading,
    response: maintenanceDetailsResult,
    request: fetchMaintenanceDetails,
  } = useApi<t.IMaintenance, t.IMaintenanceDetailsParams>({
    dynamicUrl: (p) => `/api/v1/technical_inspections/${p.inspection_id}`,
    method: "GET",
  });
  const {
    loading: createMaintenanceLoading,
    error: createMaintenanceError,
    response: newMaintenance,
    request: createMaintenanceRequest,
  } = useApi<t.IMaintenance, t.IMaintenanceForm>({
    url: "/api/v1/technical_inspections",
    method: "POST",
  });
  const {
    loading: updateMaintenanceLoading,
    error: updateMaintenanceError,
    response: editedMaintenance,
    request: updateMaintenanceRequest,
  } = useApi<t.IMaintenance, t.IMaintenanceEditParams>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/${p.inspection_id}?company_id=${p.company_id}`,
    method: "PATCH",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

  const initialParams: t.IMaintenanceListParams = {
    limit: 20,
    page: 1,
    plate_number: undefined,
    company_ids: currentCompanyId.value,
  };
  const emptyMaintenanceForm: t.IMaintenanceForm = {
    vehicle_id: undefined,
    ordinal: undefined,
    inspection_date: "",
    mileage_at_inspection: undefined,
    extra_info: "",
  };

  const validatorOrdinal = (rule: any, value: string, callback: any) => {
    if (Number(value) <= 0) {
      return callback(new Error("Неверный номер TO"));
    }
    return callback();
  };

  const maintenanceRef = ref<FormInstance>();
  const maintenanceRules = reactive<FormRules>({
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    inspection_date: [
      {
        required: true,
        message: "Выберите дату прохождения",
        trigger: "change",
      },
    ],
    mileage_at_inspection: [
      {
        required: true,
        message: "Введите текущий пробег",
        trigger: "change",
      },
    ],
    ordinal: [
      {
        required: true,
        message: "Введите номер ТО",
        trigger: "blur",
      },
      {
        validator: validatorOrdinal,
        trigger: "blur",
      },
    ],
  });
  const maintenanceForm = ref({
    ...emptyMaintenanceForm,
  });

  const maintenanceList = computed<any[]>(() => {
    return maintenanceResponse.value?.items ?? [];
  });
  const maintenanceListTotalItems = computed(
    () => maintenanceResponse.value?.total_items ?? 0
  );

  watch(maintenanceDetailsResult, (v) => {
    if (v) {
      clear();
      const keys = Object.keys(v) as (keyof t.IMaintenanceForm)[];
      keys.forEach((key) => {
        if (key in maintenanceForm.value) {
          // @ts-ignore
          maintenanceForm.value[key] = v[key];
        }
      });
    }
  });

  const createMaintenance = async (): Promise<void> => {
    validatePromise(maintenanceRef.value!).then(async () => {
      try {
        await createMaintenanceRequest({
          ...maintenanceForm.value,
          mileage_at_inspection: Number(
            maintenanceForm.value.mileage_at_inspection
          ),
          ordinal: Number(maintenanceForm.value.ordinal),
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Новое техобслуживание добавленo",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createMaintenanceError.value?.title ?? "Ошибка",
          message:
            createMaintenanceError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateMaintenance = async (): Promise<void> => {
    validatePromise(maintenanceRef.value!).then(async () => {
      try {
        await updateMaintenanceRequest({
          inspection_id: maintenanceDetailsResult.value?.id!,
          company_id: currentCompanyId.value!,
          extra_info: maintenanceForm.value.extra_info,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Техобслуживание изменено",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: "Ошибка",
          message: "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    maintenanceForm.value = { ...emptyMaintenanceForm };
  };

  return {
    initialParams,
    maintenanceRef,
    maintenanceRules,
    maintenanceForm,

    maintenanceList,
    maintenanceListTotalItems,
    maintenanceListLoading,
    fetchMaintenanceList,

    maintenanceDetailsLoading,
    maintenanceDetailsResult,
    fetchMaintenanceDetails,

    createMaintenanceLoading,
    createMaintenanceError,
    newMaintenance,
    createMaintenance,

    updateMaintenanceLoading,
    updateMaintenanceError,
    editedMaintenance,
    updateMaintenance,

    clear,
  };
};

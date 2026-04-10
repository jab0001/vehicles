import { computed, reactive, ref } from "vue";
import useApi from "@/composables/useApi";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
import type { IPagination } from "@/types/apiDefault";
import type {
  IIntegration,
  IIntegrationCreateForm,
  IIntegrationDraftsCreateBody,
  IIntegrationDraftsCreateResponse,
  IIntegrationImportStatusesBody,
  IIntegrationImportTask,
  IIntegrationsListParams,
  IIntegrationUpdateForm,
  TIntegrationImportForm,
  TIntegrationImportTaskStatus,
  TIntegrationImportType,
} from "@/types/integrations";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";
import type { IDriver } from "@/types/drivers";
import * as t from "@/types/drafts";
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import {
  getUserFullname,
  getVehicleFullname,
} from "@/helpers/fullname.helpers";
import type { IVehicle } from "@/types/vehicles";

export const useIntegrations = () => {
  const { validatePromise } = useHelpers();

  const integrationsFilters = ref({
    page: 1,
    limit: 20,
  });

  // Получение списка интеграций
  const {
    loading: fetchIntegrationsLoading,
    response: integrationsResponse,
    request: fetchIntegrationsRequest,
  } = useApi<IPagination<IIntegration>, IIntegrationsListParams>({
    url: "/api/v1/integrations",
    method: "GET",
  });

  // Получение интеграции по ID
  const {
    loading: integrationDetailsLoading,
    response: integrationDetailsResult,
    request: fetchIntegrationDetails,
  } = useApi<IIntegration, { integration_id: number }>({
    dynamicUrl: (p) => `/api/v1/integrations/${p.integration_id}`,
    method: "GET",
  });

  // Создание интеграции
  const {
    loading: createIntegrationLoading,
    error: createIntegrationError,
    response: newIntegration,
    request: createIntegrationRequest,
  } = useApi<IIntegration, IIntegrationCreateForm>({
    url: "/api/v1/integrations",
    method: "POST",
  });

  // Обновление интеграции
  const {
    loading: updateIntegrationLoading,
    error: updateIntegrationError,
    response: updateIntegrationResponse,
    request: updateIntegrationRequest,
  } = useApi<IIntegration, IIntegrationUpdateForm & { integration_id: number }>(
    {
      dynamicUrl: (p) => `/api/v1/integrations/${p.integration_id}`,
      method: "PUT",
    }
  );

  // изменения статуса интеграции
  const {
    loading: manageIntegrationLoading,
    error: manageIntegrationError,
    response: manageIntegrationResponse,
    request: manageIntegrationRequest,
  } = useApi<
    IIntegration,
    { integration_id: number; enabled: boolean; sms_code: string | null }
  >({
    dynamicUrl: (p) => `/api/v1/integrations/${p.integration_id}/manage`,
    method: "POST",
  });

  // Удаление интеграции
  const {
    loading: deleteIntegrationLoading,
    error: deleteIntegrationError,
    response: deleteIntegrationResponse,
    request: deleteIntegrationRequest,
  } = useApi<void, { integration_id: number }>({
    dynamicUrl: (p) => `/api/v1/integrations/${p.integration_id}`,
    method: "DELETE",
  });

  // Вычисляемые свойства
  const integrations = computed(() => {
    return integrationsResponse.value?.items ?? [];
  });

  const integrationsTotalItems = computed(
    () => integrationsResponse.value?.total_items ?? 0
  );

  // Получение активных интеграций
  const activeIntegrations = computed(() => {
    return integrations.value.filter((i) => i.enabled);
  });

  // Получение интеграций по типу
  const getIntegrationsByType = (type: "YANDEX" | "STARLINE") => {
    return integrations.value.filter((i) => i.type === type && i.enabled);
  };

  const { hideDrawer } = useAppStore();

  const modalSmsCodeVisible = ref(false);

  const INTEGRATION_DEFAULT_CREDENTIALS = {
    YANDEX: {
      api_key: "",
      client_id: "",
      park_id: "",
    },
    STARLINE: {
      app_id: "",
      secret: "",
      login: "",
      password: "",
    },
    GLONASS_SOFT: {
      login: "",
      token: "",
      password: "",
    },
  } as const;

  type IntegrationType = keyof typeof INTEGRATION_DEFAULT_CREDENTIALS;

  function getDefaultIntegrationForm<T extends IntegrationType>(
    type: T
  ): Extract<IIntegrationCreateForm, { type: T }> {
    return {
      name: "",
      type,
      credentials: { ...INTEGRATION_DEFAULT_CREDENTIALS[type] },
    } as Extract<IIntegrationCreateForm, { type: T }>;
  }
  const createIntegrationForm = ref<IIntegrationCreateForm>(
    getDefaultIntegrationForm("YANDEX")
  );

  const clearIntegrationForm = () => {
    createIntegrationForm.value = getDefaultIntegrationForm("YANDEX");
  };

  const fetchIntegrations = async () => {
    await fetchIntegrationsRequest({
      page: integrationsFilters.value.page,
      limit: integrationsFilters.value.limit,
    });
  };

  const createIntegrationFormRef = ref<FormInstance>();

  // Метод создания интеграции
  const createIntegration = async (): Promise<void> => {
    validatePromise(createIntegrationFormRef.value!).then(async () => {
      try {
        await createIntegrationRequest({
          ...createIntegrationForm.value,
        });

        ElNotification({
          title: "Успешный запрос",
          message: "Интеграция успешно создана",
          type: "success",
        });
        hideDrawer();
        await fetchIntegrations();
      } catch (e) {
        ElNotification({
          title: createIntegrationError.value?.title ?? "Ошибка",
          message:
            createIntegrationError.value?.message ??
            "Произошла ошибка при создании интеграции, обратитесь к администратору",
          type: "error",
        });
        throw e;
      }
    });
  };

  // Метод обновления интеграции
  const updateIntegration = async (
    integration_id: number,
    data: IIntegrationUpdateForm
  ): Promise<void> => {
    validatePromise(createIntegrationFormRef.value!).then(async () => {
      try {
        await updateIntegrationRequest({
          integration_id,
          ...data,
        });

        ElNotification({
          title: "Успешный запрос",
          message: "Интеграция успешно обновлена",
          type: "success",
        });
        hideDrawer();
        await fetchIntegrations();
      } catch (e) {
        ElNotification({
          title: updateIntegrationError.value?.title ?? "Ошибка",
          message:
            updateIntegrationError.value?.message ??
            "Произошла ошибка при обновлении интеграции, обратитесь к администратору",
          type: "error",
        });
        throw e;
      }
    });
  };

  // Метод обновления статуса интеграции
  const manageIntegration = async (
    integration_id: number,
    data: { enabled: boolean; sms_code: string | null }
  ): Promise<void> => {
    try {
      await manageIntegrationRequest({ integration_id, ...data });

      ElNotification({
        title: "Успешный запрос",
        message: "Статус интеграции обновлен",
        type: "success",
      });

      await fetchIntegrations();
    } catch (e) {
      ElNotification({
        title: manageIntegrationError.value?.title ?? "Ошибка",
        message:
          manageIntegrationError.value?.message ??
          "Произошла ошибка при обновлении интеграции",
        type: "error",
      });

      if ((e as any)?.data?.error_code === "need_2fa_for_auth") {
        modalSmsCodeVisible.value = true;
        return;
      }
      throw e;
    }
  };

  // Метод удаления интеграции
  const deleteIntegration = async (integration_id: number): Promise<void> => {
    try {
      await deleteIntegrationRequest({
        integration_id,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Интеграция успешно удалена",
        type: "success",
      });

      // Обновляем список интеграций после успешного удаления
      await fetchIntegrations();
    } catch (e) {
      ElNotification({
        title: deleteIntegrationError.value?.title ?? "Ошибка",
        message:
          deleteIntegrationError.value?.message ??
          "Произошла ошибка при удалении интеграции, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const getIntegrationById = (id: number) => {
    return integrations.value.find((i) => i.id === id);
  };

  return {
    // List
    fetchIntegrationsLoading,
    integrationsFilters,
    integrationsResponse,
    fetchIntegrations,
    fetchIntegrationsRequest,
    integrations,
    integrationsTotalItems,
    activeIntegrations,
    getIntegrationsByType,

    // Details
    integrationDetailsLoading,
    integrationDetailsResult,
    fetchIntegrationDetails,

    // Create
    createIntegrationLoading,
    createIntegrationError,
    newIntegration,
    createIntegration,
    createIntegrationForm,
    createIntegrationFormRef,
    clearIntegrationForm,
    getDefaultIntegrationForm,

    // Update
    updateIntegrationLoading,
    updateIntegrationError,
    updateIntegrationResponse,
    updateIntegration,
    manageIntegration,

    // Delete
    deleteIntegrationLoading,
    deleteIntegrationError,
    deleteIntegrationResponse,
    deleteIntegration,

    modalSmsCodeVisible,

    getIntegrationById,
  };
};

export const useIntegrationsImport = () => {
  const { validatePromise } = useHelpers();
  const {
    loading: draftsImportListLoading,
    response: draftsImportResponse,
    request: fetchDraftsImportList,
  } = useApi<IPagination<t.IDraft>, t.IDraftListParams>({
    url: "/api/v1/drafts",
    method: "GET",
  });

  const { getCarBrandById, getCarModelById, getCarColorById } =
    useReferenceBooksStore();

    const isImportedDraft = ref<boolean>(false);

  const driversDraftImportList = computed<IDriver[]>(() => {
    const isDriverType = draftsImportResponse.value?.items.some((draft) => {
      return draft.draft_type === "driver";
    });
    if (!isDriverType) return [];

    return (
      draftsImportResponse.value?.items?.map((d) => {
        const driver = d.data as IDriver;
        return {
          ...driver,
          fullname: getUserFullname(
            driver.lastname,
            driver.firstname,
            driver.middlename
          ),
          id: d.id,
          source_integration_id: d.source_integration_id,
          source: d.source
        };
      }) ?? []
    );
  });
  const vehiclesDraftImportList = computed<IVehicle[]>(() => {
    const isVehicleType = draftsImportResponse.value?.items.some((draft) => {
      return draft.draft_type === "vehicle";
    });
    if (!isVehicleType) return [];

    return (
      draftsImportResponse.value?.items?.map((d) => {
        const vehicle = d.data as IVehicle;
        return {
          ...vehicle,
          color: vehicle?.color_id
            ? {
                id: vehicle?.color_id,
                color: vehicle?.color_id
                  ? getCarColorById(vehicle?.color_id)
                  : "",
              }
            : undefined,
          brand: vehicle?.brand_id
            ? {
                id: vehicle?.brand_id,
                brand: vehicle?.brand_id
                  ? getCarBrandById(vehicle.brand_id)
                  : "",
              }
            : undefined,
          car_model: vehicle?.car_model_id
            ? {
                id: vehicle?.car_model_id,
                brand_id: vehicle?.brand_id ?? 0,
                car_model: vehicle?.car_model_id
                  ? getCarModelById(vehicle.car_model_id)
                  : "",
              }
            : undefined,
          id: d.id,
          source_integration_id: d.source_integration_id,
          source: d.source
        };
      }) ?? []
    );
  });

  const draftImportTotalItems = computed(
    () => draftsImportResponse.value?.total_items ?? 0
  );

  // Импорт из интеграции
  const {
    loading: integrationImportLoading,
    error: integrationImportError,
    response: newImport,
    request: integrationImportRequest,
  } = useApi<IIntegrationImportTask, TIntegrationImportForm>({
    dynamicUrl: (p) =>
      `/api/v1/integration_import/import/${p.import_type}s/${p.integration_id}`,
    method: "POST",
  });

  // Узнать состояние импорта
  const {
    loading: integrationImportTasksLoading,
    error: integrationImportTasksError,
    response: integrationImportTasks,
    request: integrationImportTasksRequest,
  } = useApi<
    IPagination<IIntegrationImportTask>,
    IIntegrationImportStatusesBody
  >({
    url: "/api/v1/integration_import/statuses",
    method: "POST",
  });

  // получение статуса импорта
  const {
    loading: integrationStatusLoading,
    response: integrationStatusResult,
    request: integrationStatusRequest,
  } = useApi<IIntegrationImportTask, { integration_import_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/integration_import/status/${p.integration_import_id}`,
    method: "GET",
  });

  // создание из импортированных
  const {
    loading: createIntegrationsLoading,
    error: createIntegrationsError,
    response: createIntegrationsResponse,
    request: createIntegrationsRequest,
  } = useApi<
    IIntegrationDraftsCreateResponse,
    IIntegrationDraftsCreateBody & { type: TIntegrationImportType }
  >({
    dynamicUrl: (p) => `/api/v1/integration_import/drafts/${p.type}s`,
    method: "POST",
  });

  const ACTIVE_STATUSES = ["pending", "in_progress"] as const;

  type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

  const isActiveStatus = (
    status: TIntegrationImportTaskStatus
  ): status is ActiveStatus => {
    return ACTIVE_STATUSES.includes(status as ActiveStatus);
  };

  const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 10000;

  const integrationsImportFilters = ref({
    page: 1,
    limit: 20,
  });

  const integrationsAddRef = ref<FormInstance>();

  const integrationsImportList = computed(() => {
    return integrationImportTasks.value?.items ?? [];
  });

  const integrationsImportTotalItems = computed(
    () => integrationImportTasks.value?.total_items ?? 0
  );

  const hasActiveImports = () => {
    return integrationsImportList.value.some((task) =>
      isActiveStatus(task.status)
    );
  };

  const startIntegrationPolling = async (
    params?: IIntegrationImportStatusesBody
  ) => {
    stopIntegrationPolling();

    await integrationImportTasksRequest(params);

    pollingTimer.value = setInterval(async () => {
      await integrationImportTasksRequest(params);

      if (!hasActiveImports()) {
        stopIntegrationPolling();
      }
    }, POLLING_INTERVAL);
  };

  const stopIntegrationPolling = () => {
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
    }
  };

  const integrationImport = async (
    form: TIntegrationImportForm,
    params: IIntegrationImportStatusesBody
  ): Promise<void> => {
    validatePromise(integrationsAddRef.value!).then(async () => {
      try {
        await integrationImportRequest({
          ...form,
        });

        ElNotification({
          title: "Успешный запрос",
          message: "Импорт успешно начат",
          type: "success",
        });

        await startIntegrationPolling(params);
      } catch (e) {
        ElNotification({
          title: integrationImportError.value?.title ?? "Ошибка",
          message:
            integrationImportError.value?.message ??
            "Произошла ошибка при обновлении интеграции, обратитесь к администратору",
          type: "error",
        });
        throw e;
      }
    });
  };

  const importDraftStatuses = ref<
    Map<number, { status: "success" | "error"; message?: string }>
  >(new Map());

  const applyCreateResult = (response: IIntegrationDraftsCreateResponse) => {
    response.created?.forEach((id) => {
      importDraftStatuses.value.set(id, { status: "success" });
    });

    response.failed?.forEach((item) => {
      importDraftStatuses.value.set(item.draft_id, {
        status: "error",
        message: item.error,
      });
    });
  };

  const createIntegrationImport = async (
    drafts_ids: IIntegrationDraftsCreateBody,
    type: TIntegrationImportType
  ): Promise<void> => {
    try {
      const res = await createIntegrationsRequest({ ...drafts_ids, type });

      applyCreateResult(res);

      /* ElNotification({
        title: "Успешный запрос",
        message: "Элементы успешно созданы",
        type: "success",
      }); */
    } catch (e) {
      ElNotification({
        title: createIntegrationsError.value?.title ?? "Ошибка",
        message:
          createIntegrationsError.value?.message ??
          "Произошла ошибка при обновлении интеграции, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const getIntegrationImportStatus = (status: string) => {
    switch (status) {
      case "in_progress":
        return "В процессе...";
      case "done":
        return "Завершен";
      case "pending":
        return "В ожидании...";
      case "failed":
        return "Завершен с ошибкой";
      default:
        return "";
    }
  };
  const getIntegrationImportStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "#909399";
      case "pending":
        return "#E6A23C";
      case "done":
        return "#67C23A";
      case "failed":
        return "#ef4444";
      default:
        break;
    }
  };

  return {
    // Import
    integrationImportLoading,
    newImport,
    integrationImport,

    integrationsImportFilters,
    integrationsImportList,
    integrationsImportTotalItems,

    integrationsAddRef,

    //tasks
    integrationImportTasksError,
    startIntegrationPolling,
    stopIntegrationPolling,
    integrationImportTasksLoading,

    //polling
    integrationStatusLoading,
    integrationStatusResult,
    integrationStatusRequest,

    // to drafts
    createIntegrationsLoading,
    createIntegrationsResponse,
    createIntegrationImport,

    getIntegrationImportStatus,
    getIntegrationImportStatusColor,

    //drafts imported

    fetchDraftsImportList,
    draftsImportListLoading,
    driversDraftImportList,
    vehiclesDraftImportList,
    draftImportTotalItems,
    importDraftStatuses,

    isImportedDraft
  };
};

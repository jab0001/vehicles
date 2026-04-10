import { ref, reactive } from "vue";
import useApi from "@/composables/useApi";
import { ElNotification } from "element-plus";
import type { IPagination } from "@/types/apiDefault";

export type TInspectionType = "weekly" | "mobile" | "handing" | "return";

export interface IInspectionReminder {
  days_before?: number;
  text?: string;
}

export interface IInspectionFine {
  days_after: number;
  text: string;
  amount: number;
  repeat: boolean;
}

export interface IInspectionTypeSettings {
  frequency: number | null;
  reminders: IInspectionReminder[];
  fines: IInspectionFine[];
}

export interface IInspectionProfileSettings {
  weekly?: IInspectionTypeSettings;
  mobile?: IInspectionTypeSettings;
  handing?: IInspectionTypeSettings;
  return?: IInspectionTypeSettings;
}

export interface IInspectionProfileCreateParams {
  name: string;
  enabled_inspection_types: TInspectionType[];
  settings: IInspectionProfileSettings;
}

export interface IInspectionProfile extends IInspectionProfileCreateParams {
  id: number;
  created_at: string;
  updated_at: string;
  is_default?: boolean;
  vehicles_count?: number;
}

export interface IInspectionProfilesListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Интерфейс для назначения профиля осмотра автомобилю
export interface IAssignProfileToVehicleParams {
  vehicle_id: number;
  profile_id: number;
}

// Интерфейс для получения профиля осмотра автомобиля
export interface IVehicleInspectionProfile {
  vehicle_id: number;
  profile_id: number;
  profile?: IInspectionProfile;
}

export const useInspectionProfiles = () => {
  // Create inspection profile
  const {
    loading: createInspectionProfileLoading,
    error: createInspectionProfileError,
    response: newInspectionProfile,
    request: createInspectionProfileRequest,
  } = useApi<IInspectionProfile, IInspectionProfileCreateParams>({
    url: "/api/v1/inspection_profiles",
    method: "POST",
  });

  const createInspectionProfile = async (
    params: IInspectionProfileCreateParams
  ): Promise<void> => {
    try {
      await createInspectionProfileRequest(params);
      ElNotification({
        title: "Успешный запрос",
        message: "Профиль осмотра успешно создан",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createInspectionProfileError.value?.title ?? "Ошибка",
        message:
          createInspectionProfileError.value?.message ??
          "Произошла ошибка при создании профиля осмотра, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Get inspection profiles list
  const {
    loading: fetchInspectionProfilesLoading,
    response: inspectionProfilesResponse,
    request: fetchInspectionProfiles,
  } = useApi<IPagination<IInspectionProfile>, IInspectionProfilesListParams>({
    url: "/api/v1/inspection_profiles",
    method: "GET",
  });

  // Get inspection profile details
  const {
    loading: inspectionProfileDetailsLoading,
    response: inspectionProfileDetailsResult,
    request: fetchInspectionProfileDetails,
  } = useApi<IInspectionProfile, { profile_id: number }>({
    dynamicUrl: (p) => `/api/v1/inspection_profiles/${p.profile_id}`,
    method: "GET",
  });

  // Update inspection profile
  const {
    loading: updateInspectionProfileLoading,
    error: updateInspectionProfileError,
    response: updateInspectionProfileResponse,
    request: updateInspectionProfileRequest,
  } = useApi<
    IInspectionProfile,
    IInspectionProfileCreateParams & { profile_id: number }
  >({
    dynamicUrl: (p) => `/api/v1/inspection_profiles/${p.profile_id}`,
    method: "PUT",
  });

  const updateInspectionProfile = async (
    profile_id: number,
    params: IInspectionProfileCreateParams
  ): Promise<void> => {
    try {
      await updateInspectionProfileRequest({
        ...params,
        profile_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Профиль осмотра успешно обновлен",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: updateInspectionProfileError.value?.title ?? "Ошибка",
        message:
          updateInspectionProfileError.value?.message ??
          "Произошла ошибка при обновлении профиля осмотра, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Delete inspection profile
  const {
    loading: deleteInspectionProfileLoading,
    error: deleteInspectionProfileError,
    response: deleteInspectionProfileResponse,
    request: deleteInspectionProfileRequest,
  } = useApi<void, { profile_id: number }>({
    dynamicUrl: (p) => `/api/v1/inspection_profiles/${p.profile_id}`,
    method: "DELETE",
  });

  const deleteInspectionProfile = async (profile_id: number): Promise<void> => {
    try {
      await deleteInspectionProfileRequest({ profile_id });
      ElNotification({
        title: "Успешный запрос",
        message: "Профиль осмотра успешно удален",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: deleteInspectionProfileError.value?.title ?? "Ошибка",
        message:
          deleteInspectionProfileError.value?.message ??
          "Произошла ошибка при удалении профиля осмотра, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Assign inspection profile to vehicle
  const {
    loading: assignProfileToVehicleLoading,
    error: assignProfileToVehicleError,
    response: assignProfileToVehicleResponse,
    request: assignProfileToVehicleRequest,
  } = useApi<IVehicleInspectionProfile, IAssignProfileToVehicleParams>({
    url: "/api/v1/vehicles/inspection_profile",
    method: "POST",
  });

  const assignProfileToVehicle = async (
    vehicle_id: number,
    profile_id: number
  ): Promise<void> => {
    try {
      await assignProfileToVehicleRequest({
        vehicle_id,
        profile_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Профиль осмотра успешно назначен автомобилю",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: assignProfileToVehicleError.value?.title ?? "Ошибка",
        message:
          assignProfileToVehicleError.value?.message ??
          "Произошла ошибка при назначении профиля осмотра автомобилю, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Get vehicle inspection profile
  const {
    loading: vehicleInspectionProfileLoading,
    response: vehicleInspectionProfileResult,
    request: fetchVehicleInspectionProfile,
  } = useApi<IVehicleInspectionProfile, { vehicle_id: number }>({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/inspection_profile`,
    method: "GET",
  });

  // Get vehicles with specific profile
  const {
    loading: vehiclesWithProfileLoading,
    response: vehiclesWithProfileResponse,
    request: fetchVehiclesWithProfile,
  } = useApi<
    IPagination<any>,
    { profile_id: number } & IInspectionProfilesListParams
  >({
    dynamicUrl: (p) => `/api/v1/inspection_profiles/${p.profile_id}/vehicles`,
    method: "GET",
  });

  // Default form values for creating a new inspection profile
  const defaultInspectionTypeSettings: IInspectionTypeSettings = {
    frequency: 7,
    reminders: [
      {
        days_before: 1,
        text: "Необходимо пройти осмотр",
      },
    ],
    fines: [],
  };

  const defaultInspectionProfileForm: IInspectionProfileCreateParams = {
    name: "",
    enabled_inspection_types: [],
    settings: {
      weekly: {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      mobile: {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      handing: {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      return: {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
    },
  };

  const inspectionProfileForm = ref<IInspectionProfileCreateParams>({
    ...defaultInspectionProfileForm,
  });

  const clearInspectionProfileForm = () => {
    inspectionProfileForm.value = { ...defaultInspectionProfileForm };
  };

  const initializeTypeSettings = (type: TInspectionType) => {
    if (!inspectionProfileForm.value.settings[type]) {
      inspectionProfileForm.value.settings[type] = {
        ...defaultInspectionTypeSettings,
      };
    }
  };

  const addReminder = (type: TInspectionType) => {
    inspectionProfileForm.value.settings[type]!.reminders.push({});
  };

  const removeReminder = (type: TInspectionType, index: number) => {
    if (inspectionProfileForm.value.settings[type]?.reminders) {
      inspectionProfileForm.value.settings[type]!.reminders.splice(index, 1);
    }
  };

  const addFine = (type: TInspectionType) => {
    inspectionProfileForm.value.settings[type]!.fines.push({
      days_after: 1,
      text: "Штраф за непрохождение осмотра",
      amount: 1000,
      repeat: false,
    });
  };

  const removeFine = (type: TInspectionType, index: number) => {
    if (inspectionProfileForm.value.settings[type]?.fines) {
      inspectionProfileForm.value.settings[type]!.fines.splice(index, 1);
    }
  };

  // Получение стандартного профиля
  const {
    loading: defaultProfileLoading,
    response: defaultProfileResult,
    request: fetchDefaultProfile,
  } = useApi<IInspectionProfile, void>({
    url: "/api/v1/inspection_profiles/default",
    method: "GET",
  });

  // Загрузка профиля в форму для редактирования
  const loadProfileToForm = (profile: IInspectionProfile) => {
    const incomeSettings = JSON.parse(JSON.stringify(profile.settings));
    const settings = {
      weekly: incomeSettings.weekly ?? {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      mobile: incomeSettings.mobile ?? {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      handing: incomeSettings.handing ?? {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
      return: incomeSettings.return ?? {
        frequency: null,
        reminders: [{}],
        fines: [],
      },
    };

    inspectionProfileForm.value = {
      name: profile.name,
      enabled_inspection_types: profile.enabled_inspection_types ?? [],
      settings,
    };
  };

  // Проверка, является ли профиль стандартным
  const isDefaultProfile = (profile: IInspectionProfile): boolean => {
    return !!profile.is_default;
  };

  // Получение списка типов осмотров с их названиями
  const inspectionTypeLabels = {
    weekly: "Еженедельный осмотр",
    mobile: "Мобильный осмотр",
    handing: "Осмотр при передаче смены",
    return: "Осмотр при возврате автомобиля",
  };

  // Получение названия типа осмотра
  const getInspectionTypeLabel = (type: TInspectionType): string => {
    return inspectionTypeLabels[type] || type;
  };

  // Получение информации о следующем осмотре для автомобиля
  const {
    loading: nextInspectionLoading,
    response: nextInspectionResult,
    request: fetchNextInspection,
  } = useApi<
    {
      next_inspection_date: string;
      days_left: number;
      inspection_type: TInspectionType;
    },
    { vehicle_id: number }
  >({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/next_inspection`,
    method: "GET",
  });

  // Форматирование дней до следующего осмотра
  const formatDaysLeft = (daysLeft: number): string => {
    if (daysLeft < 0) {
      return `Просрочен на ${Math.abs(daysLeft)} ${getDaysWord(Math.abs(daysLeft))}`;
    } else if (daysLeft === 0) {
      return "Сегодня";
    } else {
      return `Через ${daysLeft} ${getDaysWord(daysLeft)}`;
    }
  };

  // Вспомогательная функция для склонения слова "день"
  const getDaysWord = (days: number): string => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "дней";
    }

    if (lastDigit === 1) {
      return "день";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "дня";
    }

    return "дней";
  };

  // Получение цвета статуса для отображения дней до осмотра
  const getInspectionStatusColor = (daysLeft: number): string => {
    if (daysLeft < 0) {
      return "var(--el-color-danger)"; // Красный для просроченных
    } else if (daysLeft <= 2) {
      return "var(--el-color-warning)"; // Желтый для скорых осмотров
    } else {
      return "var(--el-color-success)"; // Зеленый для остальных
    }
  };

  return {
    // Create
    createInspectionProfileLoading,
    createInspectionProfileError,
    newInspectionProfile,
    createInspectionProfile,

    // List
    fetchInspectionProfilesLoading,
    inspectionProfilesResponse,
    fetchInspectionProfiles,

    // Details
    inspectionProfileDetailsLoading,
    inspectionProfileDetailsResult,
    fetchInspectionProfileDetails,

    // Update
    updateInspectionProfileLoading,
    updateInspectionProfileError,
    updateInspectionProfileResponse,
    updateInspectionProfile,

    // Delete
    deleteInspectionProfileLoading,
    deleteInspectionProfileError,
    deleteInspectionProfileResponse,
    deleteInspectionProfile,

    // Default profile
    defaultProfileLoading,
    defaultProfileResult,
    fetchDefaultProfile,
    isDefaultProfile,

    // Vehicle profile assignment
    assignProfileToVehicleLoading,
    assignProfileToVehicleResponse,
    assignProfileToVehicle,
    vehicleInspectionProfileLoading,
    vehicleInspectionProfileResult,
    fetchVehicleInspectionProfile,
    vehiclesWithProfileLoading,
    vehiclesWithProfileResponse,
    fetchVehiclesWithProfile,

    // Next inspection info
    nextInspectionLoading,
    nextInspectionResult,
    fetchNextInspection,
    formatDaysLeft,
    getInspectionStatusColor,

    // Form helpers
    inspectionProfileForm,
    clearInspectionProfileForm,
    loadProfileToForm,
    initializeTypeSettings,
    addReminder,
    removeReminder,
    addFine,
    removeFine,
    defaultInspectionTypeSettings,

    // Labels
    inspectionTypeLabels,
    getInspectionTypeLabel,
  };
};

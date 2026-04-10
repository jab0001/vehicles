import useApi from "@/composables/useApi";
import type {
  IManualDaysOffParams,
  IManualDaysOffResponse,
  ICreateManualDayOffParams,
  IDeleteManualDayOffParams,
  IGetDriverProfileParams,
  IPatchDaysOffProfileResponse,
  ICreateDaysOffProfileRequest,
  ICreateDaysOffProfileResponse,
  IGetDriverProfileResponse,
  IPatchDaysOffProfileRequest,
  IDelteDaysOffProfileRequest,
  ISetDriverProfileRequest,
} from "@/types/manualDaysOff";
export const useManualDaysOff = () => {
  const {
    loading: getDaysOffLoading,
    error: getDaysOffError,
    response: getDaysOffResponse,
    request: getDaysOffRequest,
  } = useApi<IManualDaysOffResponse[], IManualDaysOffParams>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/manage/${p.driver_id}`,
    method: "GET",
  });

  const {
    loading: createManualDayOffLoading,
    error: createManualDayOffError,
    response: createManualDayOffResponse,
    request: createManualDayOffRequest,
  } = useApi<IManualDaysOffResponse, ICreateManualDayOffParams>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/manage/${p.driver_id}`,
    method: "POST",
  });

  const {
    loading: deleteManualDayOffLoading,
    error: deleteManualDayOffError,
    response: deleteManualDayOffResponse,
    request: deleteManualDayOffRequest,
  } = useApi<string, IDeleteManualDayOffParams>({
    dynamicUrl: (p) =>
      `/api/v1/manual_days_off/manage/${p.driver_id}/${p.day_off_date}`,
    method: "DELETE",
  });

  const {
    loading: getDriverProfileLoading,
    error: getDriverProfileError,
    response: getDriverProfileResponse,
    request: getDriverProfileRequest,
  } = useApi<IGetDriverProfileResponse, IGetDriverProfileParams>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/profiles/${p.driver_id}`,
    method: "GET",
  });

  const {
    loading: createDaysOffProfileLoading,
    error: createDaysOffProfileError,
    response: createDaysOffProfileResponse,
    request: createDaysOffProfileRequest,
  } = useApi<ICreateDaysOffProfileResponse, ICreateDaysOffProfileRequest>({
    url: `/api/v1/manual_days_off/profiles`,
    method: "POST",
  });

  const {
    loading: setDriverProfileLoading,
    error: setDriverProfileError,
    response: setDriverProfileResponse,
    request: setDriverProfileRequest,
  } = useApi<string, ISetDriverProfileRequest>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/profiles/${p.driver_id}`,
    method: "POST",
  });

  const {
    loading: patchDaysOffProfileLoading,
    error: patchDaysOffProfileError,
    response: patchDaysOffProfileResponse,
    request: patchDaysOffProfileRequest,
  } = useApi<IPatchDaysOffProfileResponse, IPatchDaysOffProfileRequest>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/profiles/${p.profile_id}`,
    method: "PATCH",
  });

  const {
    loading: deleteDaysOffProfileLoading,
    error: deleteDaysOffProfileError,
    response: deleteDaysOffProfileResponse,
    request: deleteDaysOffProfileRequest,
  } = useApi<string, IDelteDaysOffProfileRequest>({
    dynamicUrl: (p) => `/api/v1/manual_days_off/profiles/${p.profile_id}`,
    method: "DELETE",
  });

  return {
    getDaysOffResponse,
    getDaysOffRequest,

    createManualDayOffRequest,
    deleteManualDayOffRequest,

    getDriverProfileRequest,
    setDriverProfileRequest,

    createDaysOffProfileResponse,
    createDaysOffProfileRequest,
    patchDaysOffProfileRequest,
    deleteDaysOffProfileRequest,
  };
};

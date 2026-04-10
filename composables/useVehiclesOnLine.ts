import { computed } from "vue";
import { ElNotification } from "element-plus";

import useApi from "@/composables/useApi";
import {
  getUserFullname,
  getVehicleFullname,
} from "@/helpers/fullname.helpers";

import * as t from "@/types/vehiclesOnLine";
import type { IPagination } from "@/types/apiDefault";

export const useVehiclesOnLine = () => {
  const {
    loading: fetchLoading,
    response: vehiclesOnLineResponse,
    request: fetchVehiclesOnLine,
  } = useApi<IPagination<t.IVehiclesOnLineItem>, t.IVehiclesOnLineParams>({
    url: "/api/v1/vehicles_on_line/releases",
    method: "GET",
  });

  const {
    loading: releaseToLineLoading,
    response: releasedVehicle,
    error: releaseToLineError,
    request: releaseVehicleToLine,
  } = useApi<t.IVehiclesOnLineItem, t.IReleaseVehiclesToLineParams>({
    dynamicUrl: (p) =>
      `/api/v1/vehicles_on_line/${p.vehicle_id}/${p.driver_id}`,
    method: "POST",
  });

  const {
    loading: addEquidToReleaseLoading,
    response: addEquidToReleaseResp,
    error: addEquidToReleaseError,
    request: addEquidToRelease,
  } = useApi<t.IVehiclesOnLineItem, t.IReleaseVehiclesToLineAddEquipParams>({
    dynamicUrl: (p) =>
      `/api/v1/vehicles_on_line/${p.vehicle_on_line_id}/extra-equipment`,
    method: "POST",
  });

  const {
    loading: removeEquidToReleaseLoading,
    response: removeEquidToReleaseResp,
    error: removeEquidToReleaseError,
    request: removeEquidToRelease,
  } = useApi<t.IVehiclesOnLineItem, t.IReleaseVehiclesToLineAddEquipParams>({
    dynamicUrl: (p) =>
      `/api/v1/vehicles_on_line/${p.vehicle_on_line_id}/extra-equipment`,
    postBodyParams: true,
    method: "DELETE",
  });

  const {
    loading: removeFromLineLoading,
    response: removedVehicle,
    error: removeFromLineError,
    request: removeVehicleFromLine,
  } = useApi<
    t.IVehiclesOnLineItem,
    {
      vehicle_id: number;
      driver_id: number;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/vehicles_on_line/${p.vehicle_id}/${p.driver_id}`,
    method: "DELETE",
  });

  const initialFilters: t.IVehiclesOnLineParams = {
    limit: 20,
    page: 1,
    order_by: "event_date",
    direction: "desc",
    driver_id: undefined,
    vehicle_id: undefined,
  };

  const vehiclesOnLine = computed<t.IVehiclesOnLineItem[]>(() => {
    return (
      vehiclesOnLineResponse.value?.items?.map((v) => ({
        ...v,
        driver: {
          ...v.driver,
          fullname: getUserFullname(
            v.driver.lastname,
            v.driver.firstname,
            v.driver.middlename
          ),
        },
        vehicle: {
          ...v.vehicle,
          fullname: getVehicleFullname(
            v.vehicle.brand,
            v.vehicle.car_model,
            v.vehicle.plate_number
          ),
        },
      })) ?? []
    );
  });
  const vehiclesOnLineTotalItems = computed(
    () => vehiclesOnLineResponse.value?.total_items ?? 0
  );

  return {
    vehiclesOnLine,
    vehiclesOnLineTotalItems,
    fetchLoading,
    releaseToLineError,
    removeFromLineError,
    releaseToLineLoading,
    removeFromLineLoading,
    addEquidToReleaseLoading,
    addEquidToReleaseResp,
    addEquidToReleaseError,

    initialFilters,

    fetchVehiclesOnLine,
    releaseVehicleToLine,
    removeVehicleFromLine,
    addEquidToRelease,

    removeEquidToReleaseLoading,
    removeEquidToReleaseResp,
    removeEquidToReleaseError,
    removeEquidToRelease
  };
};

export const useDriversGroups = () => {
  const {
    loading: driverGroupsListLoading,
    response: driverGroupsResponse,
    request: fetchDriverGroupsList,
  } = useApi<
    IPagination<t.IReleasesDriverGroup>,
    t.IReleasesDriverGroupListParams
  >({
    dynamicUrl: (p) => `/api/v1/driver_groups`,
    method: "GET",
  });

  const {
    loading: createDriverGroupLoading,
    error: createDriverGroupError,
    request: createDriverGroupReq,
    response: createDriverGroupRes,
  } = useApi<t.IReleasesDriverGroup, t.IReleasesDriverGroupForm>({
    dynamicUrl: (p) => `/api/v1/driver_groups`,
    method: "POST",
  });
  const {
    loading: updateDriverGroupLoading,
    error: updateDriverGroupError,
    request: updateDriverGroupReq,
  } = useApi<t.IReleasesDriverGroup, t.IReleasesDriverGroupEditParams>({
    dynamicUrl: (p) => `/api/v1/driver_groups/${p.group_id}`,
    method: "PUT",
  });

  const driversGroupList = computed(
    () => driverGroupsResponse.value?.items ?? []
  );
  const driversGroupTotalItems = computed(
    () => driverGroupsResponse.value?.total_items ?? 0
  );

  const createDriverGroup = async (p: t.IReleasesDriverGroupForm) => {
    try {
      await createDriverGroupReq(p);
      ElNotification({
        title: "Успешный запрос",
        message: "Группа добавлена",
        type: "success",
      });
    } catch (err) {
      ElNotification({
        title: createDriverGroupError.value?.title ?? "Ошибка",
        message:
          createDriverGroupError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };
  const updateDriverGroup = async (p: t.IReleasesDriverGroupEditParams) => {
    try {
      await updateDriverGroupReq(p);
      ElNotification({
        title: "Успешный запрос",
        message: "Группа изменена",
        type: "success",
      });
    } catch (err) {
      ElNotification({
        title: updateDriverGroupError.value?.title ?? "Ошибка",
        message:
          updateDriverGroupError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getDriverGroupAccrual = (status: t.TReleaseAccrualType) => {
    switch (status) {
      case "CURRENT_DRIVER_ON_LINE":
        return "Водителю на линии";
      case "FIRST_DRIVER":
        return "Основному водителю";
      case "PROPORTIONAL":
        return "Пропорционально";
      default:
        return "";
    }
  };

  return {
    driversGroupList,
    driversGroupTotalItems,
    driverGroupsListLoading,
    fetchDriverGroupsList,

    createDriverGroupLoading,
    createDriverGroup,
    createDriverGroupRes,

    updateDriverGroupLoading,
    updateDriverGroup,

    getDriverGroupAccrual,
  };
};

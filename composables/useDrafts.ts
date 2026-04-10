import { computed, ref, reactive, watch } from "vue";

import useApi from "@/composables/useApi";
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import { formatCurrency, formatDay } from "@/helpers/format.helpers";
import {
  getUserFullname,
  getVehicleFullname,
} from "@/helpers/fullname.helpers";
import type { IPagination } from "@/types/apiDefault";
import type { IDriver } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";
import type { IInspections } from "@/types/inspections";
import * as t from "@/types/drafts";

export const useDrafts = () => {
  const {
    loading: draftsListLoading,
    response: draftsResponse,
    request: fetchDraftsList,
  } = useApi<IPagination<t.IDraft>, t.IDraftListParams>({
    url: "/api/v1/drafts",
    method: "GET",
  });
  const {
    loading: draftDetailsLoading,
    response: draftDetailsResult,
    request: fetchDraftDetails,
  } = useApi<t.IDraft, t.IDraftDetailsParams>({
    dynamicUrl: (p) => `/api/v1/drafts/${p.draft_id}`,
    method: "GET",
  });
  const {
    loading: createDraftLoading,
    error: createDraftError,
    response: newDraft,
    request: createDraftRequest,
  } = useApi<t.IDraft, t.IDraftForm>({
    url: "/api/v1/drafts",
    method: "POST",
  });
  const {
    response: updateDraftResponse,
    loading: updateDraftLoading,
    request: updateDraftRequest,
    error: updateDraftError,
  } = useApi<t.IDraft, t.IDraftEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/drafts/${p.id}`,
  });

  const { getCarBrandById, getCarModelById, getCarColorById } =
    useReferenceBooksStore();

  const selectedDraftDriver = ref<IDriver>();
  const selectedDraftVehicle = ref<IVehicle>();
  const selectedDraftInspection = ref<IInspections>();

  const driversDraftList = computed<IDriver[]>(() => {
    const isDriverType = draftsResponse.value?.items.some((draft) => {
      return draft.draft_type === "driver";
    });
    if (!isDriverType) return [];

    return (
      draftsResponse.value?.items?.map((d) => {
        const driver = d.data as IDriver;
        return {
          ...driver,
          fullname: getUserFullname(
            driver.lastname,
            driver.firstname,
            driver.middlename
          ),
          id: d.id,
        };
      }) ?? []
    );
  });
  const vehiclesDraftList = computed<IVehicle[]>(() => {
    const isVehicleType = draftsResponse.value?.items.some((draft) => {
      return draft.draft_type === "vehicle";
    });
    if (!isVehicleType) return [];

    return (
      draftsResponse.value?.items?.map((d) => {
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
        };
      }) ?? []
    );
  });

  const inspectionsDraftList = computed<IInspections[]>(() => {
    const isInspectionType = draftsResponse.value?.items.some((draft) => {
      return draft.draft_type === "vehicle_inspection";
    });
    if (!isInspectionType) return [];

    return (
      draftsResponse.value?.items?.map((d) => {
        const inspection = d.data as IInspections;
        return {
          ...inspection,
          id: d.id,
        };
      }) ?? []
    );
  });

  const draftTotalItems = computed(
    () => draftsResponse.value?.total_items ?? 0
  );

  return {
    selectedDraftDriver,
    selectedDraftVehicle,
    selectedDraftInspection,

    draftsListLoading,
    driversDraftList,
    vehiclesDraftList,
    inspectionsDraftList,
    draftTotalItems,
    fetchDraftsList,

    draftDetailsLoading,
    draftDetailsResult,
    fetchDraftDetails,

    createDraftLoading,
    createDraftError,
    newDraft,
    createDraftRequest,

    updateDraftResponse,
    updateDraftLoading,
    updateDraftError,
    updateDraftRequest,
  };
};

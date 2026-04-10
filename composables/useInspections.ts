import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import type { IPagination, TDefaultElPlusTypes } from "@/types/apiDefault";
import { type IUploadedServerFile, useFiles } from "@/composables/useFiles";
import * as t from "@/types/inspections";

import {
  ElNotification,
  type FormInstance,
  type FormRules,
  type FormValidateFailure,
  type UploadUserFile,
  type UploadFiles,
  dayjs,
} from "element-plus";

import { useDraftsStore } from "@/stores/draftsStore";
import { useCheckExtraStore } from "@/stores/checkExtraStore";

import useApi from "@/composables/useApi";
import type {
  IInspectionsFetchParams,
  IInspectionsByIdFetchParams,
} from "@/types/inspections";
import type { IDriver, IDriverDetail } from "@/types/drivers";
import type { IVehicle } from "@/types/vehicles";
import type { TFilesType } from "@/types/files";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

export const useInspections = () => {
  const {
    loading: createInspectionLoading,
    error: createInspectionError,
    response: createInspectionResponse,
    request: createInspectionRequest,
  } = useApi<t.IInspections, t.IInspections>({
    dynamicUrl: (p) => `/api/v1/vehicle_inspection/create/${p.vehicle_id}`,
    method: "POST",
  });

  const {
    loading: fetchInspectionsLoading,
    error: fetchInspectionsError,
    response: fetchInspectionsResponse,
    request: fetchInspectionsRequest,
  } = useApi<IPagination<t.IInspections>, t.IInspectionsFetchParams>({
    dynamicUrl: () => `/api/v1/vehicle_inspection/inspections`,
    method: "GET",
  });

  const {
    loading: fetchInspectionByIdLoading,
    error: fetchInspectionByIdError,
    response: fetchInspectionByIdResponse,
    request: fetchInspectionByIdRequest,
  } = useApi<t.IInspections, t.IInspectionsByIdFetchParams>({
    dynamicUrl: (p) =>
      `/api/v1/vehicle_inspection/inspections/${p.vehicle_inspection_id}`,
    method: "GET",
  });

  const {
    loading: fetchInspectionSettingsLoading,
    error: fetchInspectionSettingsError,
    response: fetchInspectionSettingsResponse,
    request: fetchInspectionSettingsRequest,
  } = useApi<t.IInspectionEquipmentItem[], { vehicle_id: number }>({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/equipment`,
    method: "GET",
  });

  const { selectedDraftInspection } = storeToRefs(useDraftsStore());
  const { uploadFileList, downloadFile } = useFiles();

  const selectedDriver = ref<IDriver | IDriverDetail | null>(null);
  const selectedVehicle = ref<IVehicle | null>(null);

  const inspectionFormDefault: t.IInspections = {
    driver_id: undefined,
    vehicle_id: undefined,
    current_mileage: 0,
    fuel_left: 1,
    inspection_type: t.InspectionType.Weekly,
    document_ids: [],
    documents: [],
    equipment_values: [],
    check_extra_values: [],
    description: "",
    signing_status: t.InspectionSignatureStatusType.NotRequired,
    signing_date: "",
  };

  const inspectionForm = ref<t.IInspections>({
    ...inspectionFormDefault,
  });

  const { checkExtraList } = storeToRefs(useCheckExtraStore());

  /* const totalLostCost = ref<number>(0); */

  const totalLostCost = ref<{ name: string; cost: number }[]>([]);
  const totalLostAmount = ref<
    { name?: string; amount: number; answer: boolean }[]
  >([]);

  const totalLostCostEquipment = computed(() => {
    return totalLostCost.value.reduce((sum, item) => sum + item.cost, 0);
  });

  const totalLostAmountExtra = computed(() => {
    return totalLostAmount.value.reduce((sum, item) => sum + item.amount, 0);
  });

  const totalLostCostEquipmentAndExtra = computed(() => {
    return totalLostCostEquipment.value + totalLostAmountExtra.value;
  });

  watch(fetchInspectionSettingsResponse, (v) => {
    if (v && !inspectionForm.value.id && inspectionForm.value.inspection_type) {
      inspectionForm.value.equipment_values = v
        .filter(
          (item) =>
            item.checkbox &&
            item.inspection_types?.includes(
              inspectionForm.value.inspection_type,
            ),
        )
        .map((item) => ({
          preset_id: item.id!,
          checkbox_value: item.checkbox!,
        }));
    }
  });

  watch(checkExtraList, (v) => {
    if (v && inspectionForm.value.inspection_type && !inspectionForm.value.id) {
      inspectionForm.value.check_extra_values = v
        .filter((item) =>
          item.inspection_types?.includes(inspectionForm.value.inspection_type),
        )
        .map((item) => ({
          check_extra_id: item.id!,
          extra_field_value: item.extra_field!,
          choice: item.choice_default!,
        }));
    }
  });

  const bodyFrontImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const bodyLeftImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const bodyRightImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const bodyBackImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const interiorDashImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const interiorFrontImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const interiorBacktImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const interiorTrunkImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const docsImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const certificateImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const extraEquipImage = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const inspections = computed<t.IInspections[]>(() => {
    console.log(
      "fetchInspectionsResponse.value?.items",
      fetchInspectionsResponse.value?.items,
    );
    return fetchInspectionsResponse.value?.items!;
  });

  const inspectionsTotalItems = computed(
    () => fetchInspectionsResponse.value?.total_items ?? 0,
  );

  const isDisabled = computed(() =>
    Boolean(fetchInspectionByIdResponse.value?.id),
  );

  // new upload
  const uploadBodyFrontImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_BODY_FRONT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        bodyFrontImage.value = [...r, ...bodyFrontImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadBodyRightImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_BODY_RIGHT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        bodyRightImage.value = [...r, ...bodyRightImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadBodyLeftImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_BODY_LEFT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        bodyLeftImage.value = [...r, ...bodyLeftImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadBodyBackImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_BODY_REAR").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        bodyBackImage.value = [...r, ...bodyBackImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadInteriorDashImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_INTERIOR_DASHBOARD").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        interiorDashImage.value = [...r, ...interiorDashImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadInteriorFrontImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_INTERIOR_FRONT_SEAT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        interiorFrontImage.value = [...r, ...interiorFrontImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadInteriorBacktImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_INTERIOR_REAR_SEAT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        interiorBacktImage.value = [...r, ...interiorBacktImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadInteriorTrunkImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_INTERIOR_TRUNK").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        interiorTrunkImage.value = [...r, ...interiorTrunkImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadDocsImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_DOCUMENTS").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        docsImage.value = [...r, ...docsImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const uploadCertificateImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_TRANSFER_ACCEPTANCE_CERTIFICATE").then(
      (r) => {
        if (r?.length) {
          inspectionForm.value.document_ids = [
            ...(inspectionForm.value.document_ids as number[]),
            ...r.map((f) => f.id),
          ];
          certificateImage.value = [...r, ...certificateImage.value].filter(
            (f) => (f as any)?.id !== undefined,
          );
        }
      },
    );
  };

  const uploadExtraEquipImage = (uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_EXTRA_EQUIPMENT").then((r) => {
      if (r?.length) {
        inspectionForm.value.document_ids = [
          ...(inspectionForm.value.document_ids as number[]),
          ...r.map((f) => f.id),
        ];
        extraEquipImage.value = [...r, ...extraEquipImage.value].filter(
          (f) => (f as any)?.id !== undefined,
        );
      }
    });
  };

  const clearInspectionsFilesLists = () => {
    bodyFrontImage.value = [];
    bodyLeftImage.value = [];
    bodyRightImage.value = [];
    bodyBackImage.value = [];
    interiorDashImage.value = [];
    interiorFrontImage.value = [];
    interiorBacktImage.value = [];
    interiorTrunkImage.value = [];
    docsImage.value = [];
    certificateImage.value = [];
    extraEquipImage.value = [];
  };

  const clearInspectionForm = () => {
    inspectionForm.value = { ...inspectionFormDefault };
    totalLostAmount.value = [];
    totalLostCost.value = [];
  };

  const clearInspectionsCarInfoWidget = () => {
    selectedDriver.value = null;
    selectedVehicle.value = null;
  };

  const createInspection = async (
    inspectionData: t.IInspections,
  ): Promise<void> => {
    try {
      await createInspectionRequest({
        ...inspectionData,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createInspectionError.value?.title ?? "Ошибка",
        message:
          createInspectionError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const fetchInspections = async (
    params: IInspectionsFetchParams,
  ): Promise<void> => {
    try {
      await fetchInspectionsRequest({ ...params });
    } catch (e) {
      ElNotification({
        title: fetchInspectionsError.value?.title ?? "Ошибка",
        message:
          fetchInspectionsError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const fetchInspectionById = async (
    params: IInspectionsByIdFetchParams,
  ): Promise<void> => {
    try {
      await fetchInspectionByIdRequest({ ...params });
    } catch (e) {
      ElNotification({
        title: fetchInspectionsError.value?.title ?? "Ошибка",
        message:
          fetchInspectionsError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getInspectionsDocsByType = (type: TFilesType) => {
    if (selectedDraftInspection.value?.documents?.length) {
      return (
        selectedDraftInspection.value?.documents?.filter(
          (f) => f.type === type,
        ) ?? []
      );
    }

    return (
      fetchInspectionByIdResponse.value?.documents?.filter(
        (f) => f.type === type,
      ) ?? []
    );
  };

  const getInspectionTypeLabel = (value: t.InspectionType): string => {
    switch (value) {
      case t.InspectionType.Weekly:
        return "Еженедельный";
      case t.InspectionType.Mobile:
        return "Мобильный";
      case t.InspectionType.Handing:
        return "Передача";
      case t.InspectionType.Return:
        return "Возврат";
      default:
        return value;
    }
  };

  const getInspectionSignatureStatusLabel = (
    value: t.InspectionSignatureStatusType,
  ): string => {
    if (value === undefined) {
      return "—";
    }
    switch (value) {
      case t.InspectionSignatureStatusType.Required:
        return "Ожидание";
      case t.InspectionSignatureStatusType.Signed:
        return "Подписан";
      case t.InspectionSignatureStatusType.Rejected:
        return "Отказ";
      case t.InspectionSignatureStatusType.NotRequired:
      default:
        return "—";
    }
  };

  const getInspectionSignatureStatusLabel2 = (
    value: t.InspectionSignatureStatusType,
  ): string => {
    console.log("test", value);
    switch (value) {
      case t.InspectionSignatureStatusType.Signed:
        return "Подписан";
      case t.InspectionSignatureStatusType.Rejected:
        return "Не подписан";
      default:
        return " ";
    }
  };

  const getInspectionFuelLevelLabel = (
    value: t.InspectionFuelLevel | undefined,
  ): string => {
    switch (value) {
      case t.InspectionFuelLevel.Empty:
        return "Пустой бак";
      case t.InspectionFuelLevel.Quarter:
        return "1/4 бака";
      case t.InspectionFuelLevel.Half:
        return "1/2 бака";
      case t.InspectionFuelLevel.ThreeQuarters:
        return "3/4 бака";
      case t.InspectionFuelLevel.Full:
        return "Полный бак";
      default:
        return "-";
    }
  };

  const inspectionTypeOptions = [
    { value: t.InspectionType.Weekly, label: "Еженедельный" },
    { value: t.InspectionType.Mobile, label: "Мобильный" },
    { value: t.InspectionType.Handing, label: "Передача" },
    { value: t.InspectionType.Return, label: "Возврат" },
  ];

  const fuelOptions = [
    { label: "Пустой бак", value: 1 },
    { label: "1/4 бака", value: 25 },
    { label: "1/2 бака", value: 50 },
    { label: "3/4 бака", value: 75 },
    { label: "Полный бак", value: 100 },
  ];

  const downloadInspections = async (
    data: IInspectionsFetchParams,
  ): Promise<void> => {
    const {
      inspection_types,
      signing_statuses,
      vehicle_id,
      driver_id,
      start_date,
      end_date,
      order_by,
      direction,
    } = data;
    try {
      const params = new URLSearchParams();

      if (inspection_types?.length) {
        inspection_types.forEach((type) => {
          params.append("inspection_types", String(type));
        });
      }
      if (signing_statuses?.length) {
        signing_statuses.forEach((status) => {
          params.append("signing_statuses", String(status));
        });
      }
      if (vehicle_id) params.append("vehicle_id", String(vehicle_id));
      if (driver_id) params.append("driver_id", String(driver_id));
      if (start_date) params.append("start_date", String(start_date));
      if (end_date) params.append("end_date", String(end_date));
      if (order_by) params.append("order_by", String(order_by));
      if (direction) params.append("direction", String(direction));

      const result = await axios.get(
        `${MAIN_ENDPOINT}api/v1/vehicle_inspection/inspections/report`,
        {
          params,
          responseType: "blob",
        },
      );

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `inspections_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Список осмотров получен",
        type: "success",
      });
    } catch (e: any) {
      if (e.response && e.response.status === 400) {
        const errorBlob = e.response.data;
        const errorText = await errorBlob.text();

        const errorJson = JSON.parse(errorText);
        const userMessage = errorJson.user_message || "Произошла ошибка";

        ElNotification({
          title: "Ошибка",
          message: userMessage,
          type: "error",
        });
      } else {
        ElNotification({
          title: "Ошибка",
          message: e.message || "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    }
  };

  return {
    fetchInspections,
    createInspection,
    getInspectionTypeLabel,
    getInspectionFuelLevelLabel,
    getInspectionSignatureStatusLabel,
    getInspectionSignatureStatusLabel2,
    fetchInspectionSettingsRequest,
    fetchInspectionById,
    getInspectionsDocsByType,
    clearInspectionForm,
    clearInspectionsFilesLists,
    clearInspectionsCarInfoWidget,

    inspectionTypeOptions,
    fuelOptions,
    createInspectionLoading,
    fetchInspectionsLoading,
    createInspectionResponse,
    inspections,
    inspectionsTotalItems,
    inspectionForm,
    fetchInspectionSettingsResponse,
    fetchInspectionByIdResponse,
    fetchInspectionsResponse,
    selectedDriver,
    selectedVehicle,

    bodyFrontImage,
    bodyLeftImage,
    bodyRightImage,
    bodyBackImage,
    interiorDashImage,
    interiorFrontImage,
    interiorBacktImage,
    interiorTrunkImage,
    docsImage,
    certificateImage,
    extraEquipImage,
    uploadBodyFrontImage,
    uploadBodyRightImage,
    uploadBodyLeftImage,
    uploadBodyBackImage,
    uploadInteriorDashImage,
    uploadInteriorFrontImage,
    uploadInteriorBacktImage,
    uploadInteriorTrunkImage,
    uploadDocsImage,
    uploadCertificateImage,
    uploadExtraEquipImage,

    isDisabled,
    totalLostCost,
    totalLostCostEquipment,
    totalLostAmount,
    totalLostAmountExtra,
    totalLostCostEquipmentAndExtra,

    downloadInspections,
  };
};

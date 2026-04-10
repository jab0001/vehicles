import { computed, ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import axios, { MAIN_ENDPOINT } from "@/api/index";

import router from "@/router";
import useApi from "@/composables/useApi";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { formatDay } from "@/helpers/format.helpers";

import * as balance from "@/types/balanceOperations";
import * as driver from "@/types/drivers";
import * as vehicle from "@/types/vehicles";
import * as fine from "@/types/fines";
import * as damage from "@/types/damages";
import * as inspection from "@/types/inspections";
import * as tkassa from "@/types/tkassa";
import * as transfer from "@/types/vehiclesOnLine";
import * as regisrtry from "@/types/documentRegistry";
import * as daysOff from "@/types/manualDaysOff";
import type { IPagination } from "@/types/apiDefault";
import type {
  IInspectionAppDriverCreateParams,
  IInspections,
} from "@/types/inspections";
import * as t from "@/types/files";
import type { UploadUserFile } from "element-plus";
import { ElNotification } from "element-plus";
import dayjs from "dayjs";

import AppDriverInspectionPartDamage from "@/components/appDriver/inspection/AppDriverInspectionPartDamage.vue";
import AppDriverInspectionPartDocuments from "@/components/appDriver/inspection/AppDriverInspectionPartDocuments.vue";
import AppDriverInspectionPartExterior from "@/components/appDriver/inspection/AppDriverInspectionPartExterior.vue";
import AppDriverInspectionPartKit from "@/components/appDriver/inspection/AppDriverInspectionPartKit.vue";
import AppDriverInspectionPartSalon from "@/components/appDriver/inspection/AppDriverInspectionPartSalon.vue";
import AppDriverInspectionPartMileage from "@/components/appDriver/inspection/AppDriverInspectionPartMileage.vue";
import AppDriverInspectionPartFuel from "@/components/appDriver/inspection/AppDriverInspectionPartFuel.vue";
import type { IDocumentRegistryFileParams } from "@/types/documentRegistry";

export interface IUploadedServerFile extends UploadUserFile {
  id: number;
  blob?: Blob;
  description?: string;
  type?: t.TFilesType | string;
}

export const useAppDriverInspectionParts = () => {
  type TInspectionPartType =
    | "mileage"
    | "fuel"
    | "exterior"
    | "salon"
    | "kit"
    | "damage"
    | "documents";
  const parts: TInspectionPartType[] = [
    "mileage",
    "fuel",
    "exterior",
    "salon",
    // "kit",
    // "damage",
    "documents",
  ];
  const activePart = ref<TInspectionPartType>(parts[0]);
  const partIdx = computed(() => {
    return parts.findIndex((part) => part === activePart.value);
  });
  const partTitle = computed(() => {
    switch (activePart.value) {
      case "mileage":
        return "Новый осмотр";
      case "fuel":
        return "Новый осмотр";
      case "exterior":
        return "Экстерьер";
      case "salon":
        return "Салон";
      case "kit":
        return "Комплект";
      case "damage":
        return "Ущерб";
      case "documents":
        return "Документы";
      default:
        return "Новый осмотр";
    }
  });
  const partComponent = computed(() => {
    switch (activePart.value) {
      case "mileage":
        return AppDriverInspectionPartMileage;
      case "fuel":
        return AppDriverInspectionPartFuel;
      case "exterior":
        return AppDriverInspectionPartExterior;
      case "salon":
        return AppDriverInspectionPartSalon;
      case "kit":
        return AppDriverInspectionPartKit;
      case "damage":
        return AppDriverInspectionPartDamage;
      case "documents":
        return AppDriverInspectionPartDocuments;
      default:
        return AppDriverInspectionPartMileage;
    }
  });

  const goToPrevPart = () => {
    if (activePart.value === "mileage") {
      return router.push({ name: "AppDriverInspections" });
    }
    activePart.value = parts[partIdx.value - 1];
  };
  const goToNextPart = () => {
    if (activePart.value === "documents") {
      return;
    }
    activePart.value = parts[partIdx.value + 1];
  };

  return {
    activePart,
    partTitle,
    partComponent,

    goToPrevPart,
    goToNextPart,
  };
};

export const useAppDriverInspections = () => {
  const {
    loading: appDriverInspectionsListLoading,
    response: appDriverInspectionsResponse,
    request: fetchAppDriverInspectionsList,
  } = useApi<IPagination<inspection.IInspections>, any>({
    url: "/api/v1/driver_app/vehicle_inspections",
    method: "GET",
  });
  const {
    loading: appDriverInspectionDetailsLoading,
    response: appDriverInspectionDetailsResult,
    request: fetchAppDriverInspectionDetails,
  } = useApi<inspection.IInspections, inspection.IInspectionsByIdFetchParams>({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/vehicle_inspections/${p.vehicle_inspection_id}`,
    method: "GET",
  });
  const {
    loading: appDriverInspectionsSettingsLoading,
    response: appDriverInspectionSettingsResponse,
    request: fetchAppDriverInspectionsSettings,
  } = useApi<
    inspection.IInspectionSetting[],
    inspection.IInspectionSettingsFetchParams
  >({
    url: "/api/v1/driver_app/vehicle_inspections_settings",
    method: "GET",
  });
  const {
    loading: appDriverInspectionLoading,
    response: appDriverInspectionResponse,
    request: fetchAppDriverCreateInspection,
    error: appDriverInspectionError,
  } = useApi<IInspections, IInspectionAppDriverCreateParams>({
    dynamicUrl: (p) => `/api/v1/driver_app/vehicle_inspections`,
    method: "POST",
  });
  const {
    loading: appDriverInspectionsSignatureIsRequiredLoading,
    response: appDriverInspectionsSignatureIsRequiredResponse,
    request: fetchDriverInspectionsSignatureIsRequired,
  } = useApi<inspection.VehicleInspectionsToSign[], any>({
    url: "/api/v1/driver_app/files/signature_is_required",
    method: "GET",
  });

  const {
    loading: signInspectionLoading,
    error: signInspectionError,
    response: signInspectionResponse,
    request: signInspectionRequest,
  } = useApi<
    inspection.IInspections,
    { vehicle_inspection_id: number; status: string }
  >({
    dynamicUrl: () => `/api/v1/driver_app/vehicle_inspections/signing`,
    method: "POST",
  });

  const createAppDriverInspection = (
    params: IInspectionAppDriverCreateParams
  ) => {
    return fetchAppDriverCreateInspection({
      ...params,
    });
  };

  const appDriverInspectionsList = ref<inspection.IInspections[]>([]);
  const appDriverInspectionsListTotalPages = computed(
    () => appDriverInspectionsResponse.value?.total_pages ?? 1
  );

  watch(
    appDriverInspectionsResponse,
    (v) => {
      if (v?.items) {
        appDriverInspectionsList.value = [
          ...appDriverInspectionsList.value,
          ...v.items,
        ];
      }
    },
    { deep: true }
  );

  const signInspection = async (
    vehicleInspectionId: number,
    status: string
  ) => {
    try {
      await signInspectionRequest({
        vehicle_inspection_id: vehicleInspectionId,
        status: status,
      });
    } catch (e) {
      ElNotification({
        title: signInspectionError.value?.title ?? "Ошибка",
        message:
          signInspectionError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const inspectionToSignList = computed(() => {
    if (!appDriverInspectionsSignatureIsRequiredResponse.value) return [];
    const vehicleInspections =
      appDriverInspectionsSignatureIsRequiredResponse.value.filter(
        (item) => item.doc_type === "vehicle_inspection"
      );
    return vehicleInspections.flatMap((item) => item.docs);
  });

  return {
    appDriverInspectionsListLoading,
    appDriverInspectionsList,
    appDriverInspectionsListTotalPages,
    fetchAppDriverInspectionsList,

    appDriverInspectionDetailsLoading,
    appDriverInspectionDetailsResult,
    fetchAppDriverInspectionDetails,

    appDriverInspectionsSettingsLoading,
    appDriverInspectionSettingsResponse,
    fetchAppDriverInspectionsSettings,

    appDriverInspectionsSignatureIsRequiredResponse,
    inspectionToSignList,
    fetchDriverInspectionsSignatureIsRequired,

    signInspectionLoading,
    signInspection,

    appDriverInspectionLoading,
    appDriverInspectionResponse,
    appDriverInspectionError,
    createAppDriverInspection,
  };
};

export const useAppDriverDriver = () => {
  const {
    loading: appDriverInfoLoading,
    response: appDriverInfo,
    request: fetchAppDriverInfo,
  } = useApi<driver.IDriver>({
    url: "/api/v1/driver_app/driver/driver",
    method: "GET",
  });
  const {
    loading: appDriverVehicleInfoLoading,
    response: appDriverVehicleInfo,
    request: fetchAppDriverVehicleInfo,
  } = useApi<vehicle.IVehicle>({
    url: "/api/v1/driver_app/driver/vehicle",
    method: "GET",
  });

  return {
    appDriverInfoLoading,
    appDriverInfo,
    fetchAppDriverInfo,

    appDriverVehicleInfoLoading,
    appDriverVehicleInfo,
    fetchAppDriverVehicleInfo,
  };
};

export const useAppDriverBalanceOperations = () => {
  const {
    loading: totalBalanceOperationsLoading,
    response: totalBalanceOperations,
    request: fetchTotalBalanceOperations,
  } = useApi<balance.IBalanceOperationTotal>({
    url: "/api/v1/driver_app/balance_operations",
    method: "GET",
  });
  const {
    loading: balanceOperationsListLoading,
    response: balanceOperationsResponse,
    request: fetchBalanceOperationsList,
  } = useApi<
    IPagination<balance.IBalanceOperationDetails>,
    balance.IBalanceOperationByCategoryParams
  >({
    url: "/api/v1/driver_app/balance_operations/by_category",
    method: "GET",
  });
  const {
    loading: balanceOperationDetailsLoading,
    response: balanceOperationDetailsResult,
    request: fetchBalanceOperationDetails,
  } = useApi<
    balance.IBalanceOperationDetails,
    balance.IBalanceOperationDetailsParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/balance_operations/${p.operation_id}`,
    method: "GET",
  });

  const balanceOperationsList = ref<balance.IBalanceOperationDetails[]>([]);
  const balanceOperationsListTotalPages = computed(
    () => balanceOperationsResponse.value?.total_pages ?? 1
  );
  watch(
    balanceOperationsResponse,
    (v) => {
      if (v?.items) {
        balanceOperationsList.value = [
          ...balanceOperationsList.value,
          ...v.items,
        ];
      }
    },
    { deep: true }
  );

  return {
    totalBalanceOperationsLoading,
    totalBalanceOperations,
    fetchTotalBalanceOperations,

    balanceOperationsListLoading,
    balanceOperationsList,
    balanceOperationsListTotalPages,
    fetchBalanceOperationsList,

    balanceOperationDetailsLoading,
    balanceOperationDetailsResult,
    fetchBalanceOperationDetails,
  };
};

export const useAppDriverFines = () => {
  const {
    loading: appDriverFinesListLoading,
    response: appDriverFinesListResponse,
    request: fetchappDriverFinesList,
  } = useApi<IPagination<fine.IFine>, fine.IDriverAppFineListParams>({
    url: "/api/v1/driver_app/fines",
    method: "GET",
  });
  const {
    loading: appDriverFineDetailsLoading,
    response: appDriverFineDetailsResult,
    request: fetchAppDriverFineDetails,
  } = useApi<fine.IFine, fine.IFineDetailsParams>({
    dynamicUrl: (p) => `/api/v1/driver_app/fines/${p.fine_id}`,
    method: "GET",
  });

  const appDriverFinesList = ref<fine.IFine[]>([]);
  const appDriverFinesListTotalPages = computed(
    () => appDriverFinesListResponse.value?.total_pages ?? 1
  );

  watch(
    appDriverFinesListResponse,
    (v) => {
      if (v?.items) {
        appDriverFinesList.value = [...appDriverFinesList.value, ...v.items];
      }
    },
    { deep: true }
  );

  return {
    appDriverFinesListLoading,
    appDriverFinesList,
    appDriverFinesListTotalPages,
    fetchappDriverFinesList,

    appDriverFineDetailsLoading,
    appDriverFineDetailsResult,
    fetchAppDriverFineDetails,
  };
};

export const useAppDriverDamages = () => {
  const {
    loading: appDriverDamagesListLoading,
    response: appDriverDamagesResponse,
    request: fetchAppDriverDamagesList,
  } = useApi<IPagination<damage.IDamage>, damage.IDriverAppDamagesListParams>({
    url: "/api/v1/driver_app/damages",
    method: "GET",
  });
  const {
    loading: appDriverDamageDetailsLoading,
    response: appDriverDamageDetailsResult,
    request: fetchAppDriverDamageDetails,
  } = useApi<damage.IDamage, damage.IDamageDetailsParams>({
    dynamicUrl: (p) => `/api/v1/driver_app/damages/${p.damage_id}`,
    method: "GET",
  });

  const appDriverDamagesList = ref<damage.IDamage[]>([]);
  const appDriverDamagesListTotalPages = computed(
    () => appDriverDamagesResponse.value?.total_pages ?? 1
  );

  watch(
    appDriverDamagesResponse,
    (v) => {
      if (v?.items) {
        appDriverDamagesList.value = [
          ...appDriverDamagesList.value,
          ...v.items,
        ];
      }
    },
    { deep: true }
  );

  return {
    appDriverDamagesListLoading,
    appDriverDamagesList,
    appDriverDamagesListTotalPages,
    fetchAppDriverDamagesList,

    appDriverDamageDetailsLoading,
    appDriverDamageDetailsResult,
    fetchAppDriverDamageDetails,
  };
};

export const useAppDriverFiles = () => {
  const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());

  const {
    loading: appDriverInspectionFileLoading,
    response: appDriverInspectionFileResponse,
    request: fetchAppDriverInspectionFile,
  } = useApi<Blob, { vehicle_inspection_id: number; file_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/files/vehicle_inspection/${p.vehicle_inspection_id}/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });

  const uploadFileList = async (
    files: UploadUserFile[] | IUploadedServerFile[],
    type: t.TFilesType
  ) => {
    let uploaded: IUploadedServerFile[] = [];
    try {
      const filtered = files.filter(
        (f) => (f as IUploadedServerFile)?.id === undefined
      );
      if (filtered.length) {
        for (let i = 0; i < filtered.length; i++) {
          const formData = new FormData();
          formData.append("file", filtered[i].raw!);
          formData.append("type", type);
          formData.append("description", filtered[i].name);
          const result = await axios.post<{ data: t.IFile }>(
            `${MAIN_ENDPOINT}api/v1/driver_app/files/vehicle_inspection`,
            formData
          );
          uploaded = [
            ...uploaded,
            {
              ...filtered[i],
              id: result.data.data.id,
              status: "success",
              type,
            },
          ];
        }
        return uploaded;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    uploadFileList,

    appDriverInspectionFileResponse,
    fetchAppDriverInspectionFile,
  };
};

export const useAppDriverTKassa = () => {
  const {
    loading: tkassaInitLoading,
    response: tkassaInitResponse,
    request: initTkassaPayment,
  } = useApi<tkassa.ITkassaPayment, tkassa.ITkassaInitParams>({
    url: `/api/v1/driver_app/payments/init`,
    method: "POST",
  });
  const {
    loading: tkassaAmountLoading,
    response: tkassaAmountResponse,
    request: amountTkassaPayment,
  } = useApi<tkassa.ITkassaAmount, tkassa.ITkassaAmountParams>({
    url: `/api/v1/driver_app/payments/helper/amount`,
    method: "POST",
  });
  const {
    loading: paymentSettingsLoading,
    response: paymentSettingsResponse,
    request: fetchPaymentSettings,
  } = useApi<{ categories: balance.TBalanceOperationsCategory[] }>({
    url: `/api/v1/driver_app/settings/payment_settings`,
    method: "GET",
  });

  const { getBalanceOperationCategory } = useBalanceOperations();
  const operationOptions = computed(() => {
    return (
      paymentSettingsResponse.value?.categories?.map((b) => {
        return {
          key: b,
          label: getBalanceOperationCategory(b),
        };
      }) ?? []
    );
  });

  return {
    tkassaInitLoading,
    tkassaInitResponse,
    initTkassaPayment,

    paymentSettingsLoading,
    paymentSettingsResponse,
    operationOptions,
    fetchPaymentSettings,

    tkassaAmountLoading,
    tkassaAmountResponse,
    amountTkassaPayment,
  };
};

export const useAppDriverGroup = () => {
  const {
    loading: transferLoading,
    response: transferData,
    request: transferRequest,
  } = useApi<transfer.ITransferRequest, transfer.ITransferRequestCreateParams>({
    url: `/api/v1/driver_app/transfer_requests/`,
    method: "POST",
  });

  const {
    loading: receiverAcceptLoading,
    response: receiverAcceptData,
    request: receiverAccept,
  } = useApi<string, transfer.ITransferReceiverAcceptParams>({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/transfer_requests/receiver_accept/${p.transfer_id}`,
    method: "POST",
  });

  const {
    loading: driverGroupLoading,
    response: driverGroupResponse,
    request: fetchDriverGroupList,
  } = useApi<
    IPagination<transfer.IReleasesDriverGroup>,
    transfer.ITransferRequestGroupParams
  >({
    url: `/api/v1/driver_app/transfer_requests/groups`,
    method: "GET",
  });

  const {
    loading: latestTransferLoading,
    response: latestTransfer,
    request: fetchLatestTransfer,
  } = useApi<transfer.ITransferRequest, transfer.ITransferLatestRequestParams>({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/transfer_requests/latest_request/${p.group_id}`,
    method: "GET",
  });

  const {
    loading: transferCancelLoading,
    response: transferCancelData,
    request: transferCancelRequest,
  } = useApi<
    transfer.ITransferRequest,
    {
      transfer_id: number;
    }
  >({
    dynamicUrl: (p) => `/api/v1/driver_app/transfer_requests/${p.transfer_id}`,
    method: "DELETE",
  });

  const driverGroup = computed(() => {
    return driverGroupResponse.value?.items.length
      ? driverGroupResponse.value?.items[
          driverGroupResponse.value?.items.length - 1
        ]
      : undefined;
  });

  return {
    transferLoading,
    transferData,
    transferRequest,

    receiverAcceptLoading,
    receiverAcceptData,
    receiverAccept,

    driverGroupLoading,
    driverGroup,
    fetchDriverGroupList,

    latestTransferLoading,
    latestTransfer,
    fetchLatestTransfer,

    transferCancelRequest,
    transferCancelLoading,
  };
};

export const useAppDriverDocumentRegistry = () => {
  const {
    loading: documentRegistryLoading,
    response: documentRegistryResponse,
    request: fetchDocumentRegistryList,
  } = useApi<
    IPagination<regisrtry.IDocumentRegistry>,
    regisrtry.IAppDriverDocumentRegistryListParams
  >({
    url: `/api/v1/driver_app/document_registry`,
    method: "GET",
  });

  const {
    loading: documentRegistryFileLoading,
    response: documentRegistryFileResponse,
    request: fetchDriverDocumentRegistryFile,
  } = useApi<Blob, IDocumentRegistryFileParams>({
    dynamicUrl: (p) =>
      `/api/v1/driver_app/document_registry/${p.document_registry_record_id}`,
    method: "GET",
    responseType: "blob",
  });

  const appDriverdocumentRegistryList = ref<regisrtry.IDocumentRegistry[]>([]);
  const appDriverdocumentRegistryListTotalPages = computed(
    () => documentRegistryResponse.value?.total_pages ?? 1
  );

  watch(
    documentRegistryResponse,
    (v) => {
      if (v?.items) {
        appDriverdocumentRegistryList.value = [
          ...appDriverdocumentRegistryList.value,
          ...v.items,
        ];
      }
    },
    { deep: true }
  );

  return {
    appDriverdocumentRegistryList,
    appDriverdocumentRegistryListTotalPages,
    documentRegistryLoading,
    fetchDocumentRegistryList,
    fetchDriverDocumentRegistryFile,
  };
};

export const useAppDriverDaysOff = () => {
  const {
    loading: daysOffLoading,
    response: daysOffResponse,
    request: fetchDaysOffList,
  } = useApi<
    daysOff.IAppDriverDaysOffResp,
    daysOff.TAppDriverManualDaysOffParams
  >({
    url: `/api/v1/driver_app/manual_days_off`,
    method: "GET",
  });

  const {
    loading: driverDaysOffDetailsLoading,
    response: driverDaysOffDetails,
    request: fetchDriverDaysOffDetails,
  } = useApi<daysOff.ICreateDaysOffProfileResponse>({
    url: `/api/v1/driver_app/manual_days_off/profile`,
    method: "GET",
  });

  const {
    loading: creareDayOffLoading,
    error: creareDayOffDataError,
    request: creareDayOffRequest,
  } = useApi<
    daysOff.IManualDaysOffResponse,
    daysOff.TAppDriverCreateManualDayOffParams
  >({
    url: `/api/v1/driver_app/manual_days_off`,
    method: "POST",
  });

  const {
    loading: deleteDayOffLoading,
    error: deleteDayOffDataError,
    request: deleteDayOff,
  } = useApi<string, daysOff.TAppDriverDeleteManualDayOffParams>({
    dynamicUrl: (p) => `/api/v1/driver_app/manual_days_off/${p.day_off_date}`,
    method: "DELETE",
  });

  return {
    driverDaysOffDetailsLoading,
    driverDaysOffDetails,
    fetchDriverDaysOffDetails,

    daysOffLoading,
    daysOffResponse,
    fetchDaysOffList,

    creareDayOffLoading,
    creareDayOffDataError,
    creareDayOffRequest,

    deleteDayOffLoading,
    deleteDayOffDataError,
    deleteDayOff,
  };
};

export const useAppDriverDashboard = () => {
  const { daysOffResponse, fetchDaysOffList } = useAppDriverDaysOff();
  const { appDriverInspectionsList, fetchAppDriverInspectionsList } =
    useAppDriverInspections();
  const { appDriverDamagesList, fetchAppDriverDamagesList } =
    useAppDriverDamages();
  const { appDriverFinesList, fetchappDriverFinesList } = useAppDriverFines();

  const getDayOffWord = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return "выходной";
    } else if (
      [2, 3, 4].includes(lastDigit) &&
      ![12, 13, 14].includes(lastTwoDigits)
    ) {
      return "выходных";
    } else {
      return "выходных";
    }
  };

  const getMonthNameInGenitive = (monthName: string) => {
    const monthsGenitive: Record<string, string> = {
      январь: "в январе",
      февраль: "в феврале",
      март: "в марте",
      апрель: "в апреле",
      май: "в мае",
      июнь: "в июне",
      июль: "в июле",
      август: "в августе",
      сентябрь: "в сентябре",
      октябрь: "в октябре",
      ноябрь: "в ноябре",
      декабрь: "в декабре",
    };

    return monthsGenitive[monthName] || `в ${monthName}`;
  };

  const currentMonthName = computed(() => {
    return dayjs().format("MMMM")?.toLowerCase();
  });

  const daysOffTitle = computed(() => {
    const count = daysOffResponse.value?.days_off?.length || 0;

    if (count === 0) {
      return "Выходные не выбраны";
    }

    const dayOffWord = getDayOffWord(count);
    const monthInGenitive = getMonthNameInGenitive(currentMonthName.value);

    return `${count} ${dayOffWord} ${monthInGenitive}`;
  });
  const inspectionsTitle = computed(() => {
    if (!appDriverInspectionsList.value?.length) {
      return "Не проводились";
    }
    return `Последний ${formatDay(appDriverInspectionsList.value[0].created_at!)}`;
  });
  const damagesTitle = computed(() => {
    if (!appDriverDamagesList.value?.length) {
      return "Ущербов нет";
    }

    if (
      appDriverDamagesList.value.some(
        (damage) => damage.status === "IN_PROGRESS"
      )
    ) {
      return "Открытый ущерб";
    }

    return "Всё оплачено";
  });
  const finesTitle = computed(() => {
    if (!appDriverFinesList.value?.length) {
      return "Штрафов нет";
    }
    if (
      appDriverFinesList.value.some((fine) =>
        ["not_paid", "not_paid_with_discount"].includes(fine.local_status)
      )
    ) {
      return "Требуется оплата";
    }

    return "Всё оплачено";
  });

  return {
    daysOffTitle,
    fetchDaysOffList,

    inspectionsTitle,
    fetchAppDriverInspectionsList,

    damagesTitle,
    fetchAppDriverDamagesList,

    finesTitle,
    fetchappDriverFinesList,
  };
};

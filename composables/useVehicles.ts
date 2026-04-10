import { computed, reactive, ref, watch } from "vue";

import useApi from "@/composables/useApi";
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import { useVehiclesStore, useVehiclesRentStore } from "@/stores/vehicles";
import { getVehicleFullname } from "@/helpers/fullname.helpers";
import type { IPagination } from "@/types/apiDefault";
import {
  type IFetchVehiclesParams,
  type IVehicleForm,
  type IVehicleFormSTSPart,
  type IVehicle,
  type IVehicleDetailParams,
  type IVehicleSts,
  type IVehicleEquipment,
  type IVehicleEquipmentForm,
  type IVehicleCreateParams,
  type IVehicleRegistrationCertificate,
  type IVehicleUpdateParams,
  type IVehicleInsuranceAddParams,
  type IVehicleInsurancesParams,
  type IVehicleInsurance,
  type IVehicleDiagnosticCardsListParams,
  type IVehicleDiagnosticCardAddParams,
  type IVehicleDiagnosticCardRemoveParams,
  type IVehicleDiagnosticCard,
  type IVehicleUpdateStsParams,
  type IVehicleStsMain,
  type IVehicleRentRedemptionPart,
  type IVehicleRentParams,
  type TAccrualType,
  type IVehicleExtraEquipmnet,
  type IVehicleExtraEquipmnetParams,
  type IVehicleRentTemplateUpdateParams,
  type IVehicleRentTemplateCreateParams,
  type IVehicleRentTemplatesResponse,
  type IVehicleRentTemplate,
  type IVehicleRentTemplateCreateResponse,
  type TVehiclePeriodicDebitType,
  type IVehicleDealPart,
  type IVehicleLicencePart,
  type IVehicleOtherPart,
  type IVehicleDowntimeReason,
  type IVehicleDowntimeReasonCreateForm,
  type IVehicleRentTemplateDetailParams,
  type IVehicleParkingPlace,
  type IVehicleParkingPlaceCreateForm,
  type IVehicleIssuanceProhibitionPart,
  type IVehicleGeopositionParams,
  type IVehicleGeoposition,
  type IVehicleRentTemplatePredictChargeDate,
  type IVehicleGroup,
  type IVehicleInsuranceForm,
  type IVehicleDiagnosticCardForm,
  type IVehicleIntegration,
  type IVehicleIntegrationsListParams,
  type IVehicleIntegrationCreateForm,
  type IVehicleIntegrationUpdateForm,
  type IVehicleIntegrationDetailParams,
  type IVehicleMileage,
  type IVehicleMileageParams,
  type IVehicleMileageForm,
  type IMileageFetchResponse,
  type IVehicleLeasing,
  type IVehicleLeasingForm,
  type IVehicleLeasingActualPayment,
  type TLeasingStatus,
  type IVehicleLeasingSchedulePayment,
  type IVehicleLeasingSchedulePaymentForm,
  type IVehicleLeasingActualPaymentForm,
  type IVehicleLeasingWidget,
} from "@/types/vehicles";
import { type IUploadedServerFile, useFiles } from "@/composables/useFiles";
import type { TFilesType } from "@/types/files";
import type { IInspections } from "@/types/inspections";
import {
  ElNotification,
  type UploadProps,
  type FormInstance,
  type UploadUserFile,
  type FormRules,
  type UploadFile,
  type UploadFiles,
  dayjs,
} from "element-plus";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/appStore";
import { useDraftsStore } from "@/stores/draftsStore";
import { useInspections } from "@/composables/useInspections";
import { EDrawerRouteHash } from "./useApp";
import { useHelpers } from "./useHelpers";
import { formatDay, formatDateToServer } from "@/helpers/format.helpers";
import { storeToRefs } from "pinia";
import type { IDriverOther } from "@/types/drivers";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { el } from "element-plus/es/locales.mjs";
import { useUserStore } from "@/stores/userStore";
import type { IInspectionsSchedule } from "@/types/inspectionsSchedule";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

export enum EVehicleTabKey {
  sts = "sts",
  deal = "deal",
  licence = "licence",
  other = "other",
  files = "files",
}

export const useVehicles = () => {
  const {
    response: vehiclesResponse,
    loading: isFetchVehiclesLoading,
    request: fetchVehicles,
  } = useApi<IPagination<IVehicle>, IFetchVehiclesParams>({
    url: "/api/v1/vehicles/vehicles",
    method: "GET",
  });
  const {
    loading: detailLoading,
    response: detailResult,
    request: fetchDetail,
  } = useApi<IVehicle, IVehicleDetailParams>({
    method: "GET",
    dynamicUrl: (p) => `/api/v1/vehicles/${p.company_id}/${p.vehicle_id}`,
  });
  const {
    loading: updateStsLoading,
    response: updateStsResult,
    request: updateStsRequest,
  } = useApi<IVehicleStsMain, IVehicleUpdateStsParams>({
    method: "PUT",
    dynamicUrl: (p) =>
      `/api/v1/vehicles/sts/${p.vehicle_id}?company_id=${p.company_id}`,
  });
  const {
    loading: vehicleStsHistoryLoading,
    response: vehicleStsHistoryResult,
    request: vehicleStsHistoryRequest,
  } = useApi<[], { vehicle_id: number; company_id: number }>({
    method: "GET",
    dynamicUrl: (p) => `/api/v1/vehicles/sts/${p.vehicle_id}`,
  });
  const {
    response: createVehicleResponse,
    loading: isCreateVehicleLoading,
    request: createVehicleRequest,
    error: createVehicleError,
  } = useApi<IVehicle, IVehicleCreateParams>({
    method: "POST",
    dynamicUrl: (p) => `/api/v1/vehicles/${p.company_id}`,
  });
  const {
    response: updateVehicleResponse,
    loading: updateVehicleLoading,
    request: updateVehicleRequest,
    error: updateVehicleError,
  } = useApi<IVehicle, IVehicleUpdateParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/vehicles/${p.company_id}/${p.id}`,
  });
  const {
    loading: inspectionsScheduleVehicleListLoading,
    response: inspectionsScheduleVehicle,
    request: fetchInspectionsScheduleVehicleList,
  } = useApi<{
    items: IInspectionsSchedule;
    vehicle_id: number;
    company_id: number;
  }>({
    dynamicUrl: (p) =>
      `/api/v1/technical_inspections/schedules/vehicles/${p.vehicle_id}`,
    method: "GET",
  });

  const { hideDrawer } = useAppStore();
  const { uploadFileList, downloadFile } = useFiles();
  const { userProfile } = storeToRefs(useUserStore());
  const route = useRoute();
  const { validatePromise, checkNumberRule, checkNumberWithZeroRule } =
    useHelpers();
  const { getInspectionFuelLevelLabel } = useInspections();
  const { selectedDraftVehicle, newDraft } = storeToRefs(useDraftsStore());
  const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
    useCompaniesManagementStore(),
  );

  const stsFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const ptsFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const extraFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const allVehicleDocuments = ref<number[]>([]);
  const uploadStsFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_STS").then((r) => {
      if (r?.length) {
        allVehicleDocuments.value = [
          ...allVehicleDocuments.value,
          ...r.map((f) => f.id),
        ];
        stsFileList.value = [...r, ...stsFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined,
        );
      }
    });
  };
  const uploadPtsFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_PTS").then((r) => {
      if (r?.length) {
        allVehicleDocuments.value = [
          ...allVehicleDocuments.value,
          ...r.map((f) => f.id),
        ];
        ptsFileList.value = [...r, ...ptsFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined,
        );
      }
    });
  };
  const uploadExtraFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "VEHICLE_EXTRA").then((r) => {
      if (r?.length) {
        allVehicleDocuments.value = [
          ...allVehicleDocuments.value,
          ...r.map((f) => f.id),
        ];
        extraFileList.value = [...r, ...extraFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined,
        );
      }
    });
  };
  const clearVehicleFilesLists = () => {
    stsFileList.value = [];
    ptsFileList.value = [];
    extraFileList.value = [];
    allVehicleDocuments.value = [];
  };
  const handleRemoveVehicleFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      allVehicleDocuments.value = allVehicleDocuments.value.filter(
        (f) => f !== id,
      );
  };
  const getVehicleDocsByType = (type: TFilesType) => {
    return detailResult.value?.documents?.filter((f) => f.type === type) ?? [];
  };
  // const { getCarBrandById, getCarModelById, getCarColorById } =
  //   useReferenceBooksStore();

  const vehicles = computed<IVehicle[]>(() => {
    return (
      vehiclesResponse.value?.items?.map((v) => ({
        ...v,
        fullname: getVehicleFullname(
          v.brand!.brand,
          v.car_model!.car_model,
          v.plate_number,
        ),
      })) ?? []
    );
  });

  const vehicleRegistrationCertificateRef = ref<FormInstance>();
  const vehicleRegistrationCertificateDefault: IVehicleRegistrationCertificate =
    {
      registration_certificate_date: "2024-01-01",
      registration_certificate_number: "123",
    };
  const vehicleCreateFormRegistrationCertificatePart =
    ref<IVehicleRegistrationCertificate>({
      ...vehicleRegistrationCertificateDefault,
    });

  const vehicleCreateFormSTSPartRef = ref<FormInstance>();
  const vehicleCreateFormSTSPartDefault: IVehicleFormSTSPart = {
    company_id: currentCompanyId.value,
    counterparty_id: undefined,
    sts_number: "",
    issued_date: "",
    expires_at: "",
    vin: "",
    plate_number: "",
    body_number: "",
    engine_number: "",
    manufacture_date: "",
    manufacture_year: null,
    vehicle_data_sheet_number: "string",
    engine_horsepower: 10,
    comment: "",
  };
  const vehicleCreateFormSTSPart = ref<IVehicleFormSTSPart>({
    ...vehicleCreateFormSTSPartDefault,
  });

  const vehicleCreateFormDealPartRef = ref<FormInstance>();
  const vehicleCreateFormDealPartDefault: IVehicleDealPart = {
    company_id: currentCompanyId.value,
    possession_status: null,
  };
  const vehicleCreateFormDealPart = ref<IVehicleDealPart>({
    ...vehicleCreateFormDealPartDefault,
  });
  const vehicleCreateFormDealPartRules = computed<FormRules>(() => {
    let rules: FormRules = {
      company_id: [
        {
          required: true,
          message: "Выберите эксплуатанта",
          trigger: "change",
        },
      ],
    };
    if (vehicleCreateFormDealPart.value.possession_status === "purchased") {
      rules = {
        ...rules,
        ...{
          purchase_amount: [
            /* {
              required: true,
              message: "Введите сумму покупки",
              trigger: "change",
            }, */
          ],
          purchase_date: [
            /* {
              required: true,
              message: "Введите дату покупки",
              trigger: "change",
            }, */
          ],
          second_key_location: [
            /* {
              required: true,
              message: "Выберите место хранения 2-го ключа",
              trigger: "change",
            }, */
          ],
        },
      };
    }
    if (vehicleCreateFormDealPart.value.possession_status === "leasing") {
      rules = {
        ...rules,
        ...{
          leasing_amount: [
            {
              required: true,
              message: "Введите сумму лизинга",
              trigger: "change",
            },
          ],
          leasing_company: [
            {
              required: true,
              message: "Выберите лизинговую компанию",
              trigger: "change",
            },
          ],
          second_key_location: [
            {
              required: true,
              message: "Выберите место хранения 2-го ключа",
              trigger: "change",
            },
          ],
          leasing_contract_number: [
            {
              required: true,
              message: "Введите номер договора",
              trigger: "change",
            },
          ],
          leasing_contract_date_issued: [
            {
              required: true,
              message: "Введите дату заключения",
              trigger: "change",
            },
          ],
          leasing_contract_date_end: [
            {
              required: true,
              message: "Введите дату окончания",
              trigger: "change",
            },
          ],
        },
      };
    }
    if (vehicleCreateFormDealPart.value.possession_status === "rented") {
      rules = {
        ...rules,
        ...{
          rent_contract_amount: [
            {
              required: true,
              message: "Введите сумму аренды",
              trigger: "change",
            },
          ],
          rent_contract_renter: [
            {
              required: true,
              message: "Выберите арендодателя",
              trigger: "change",
            },
          ],
          second_key_location: [
            {
              required: true,
              message: "Выберите место хранения 2-го ключа",
              trigger: "change",
            },
          ],
          rent_contract_number: [
            {
              required: true,
              message: "Введите номер договора",
              trigger: "change",
            },
          ],
          rent_contract_date_issued: [
            {
              required: true,
              message: "Введите дату заключения",
              trigger: "change",
            },
          ],
          rent_contract_date_end: [
            {
              required: true,
              message: "Введите дату окончания",
              trigger: "change",
            },
          ],
        },
      };
    }
    if (vehicleCreateFormDealPart.value.disposal) {
      rules = {
        ...rules,
        ...{
          disposal_date: [
            {
              required: true,
              message: "Введите дату выбытия",
              trigger: "change",
            },
          ],
          disposal_reason: [
            {
              required: true,
              message: "Введите причину выбытия",
              trigger: "change",
            },
          ],
        },
      };
    }
    return rules;
  });

  const vehicleCreateFormLicenceRef = ref<FormInstance>();
  const vehicleCreateFormLicenceDefault: IVehicleLicencePart = {
    licence_series: "",
    licence_issued_date: null,
    licence_expires_at: null,
  };
  const vehicleCreateFormLicenceRules = computed<FormRules>(() => ({
    // licence_issued_date: [
    //   {
    //     required: true,
    //     message: "Поле 'Лицензия: Выдано' обязательное",
    //     trigger: "change",
    //   },
    // ],
    // licence_expires_at: [
    //   {
    //     required: true,
    //     message: "Поле 'Лицензия: Истекает' обязательное",
    //     trigger: "change",
    //   },
    // ],
  }));
  const vehicleCreateFormLicence = ref<IVehicleLicencePart>({
    ...vehicleCreateFormLicenceDefault,
  });
  const clearVehicleCreateFormLicence = () => {
    vehicleCreateFormLicence.value = { ...vehicleCreateFormLicenceDefault };
  };

  const vehicleProhibitionFormRef = ref<FormInstance>();
  const vehicleProhibitionFormDefault: IVehicleIssuanceProhibitionPart = {
    issuance_prohibition: false,
    issuance_prohibition_reason: "",
  };
  const vehicleProhibitionForm = ref<IVehicleIssuanceProhibitionPart>({
    ...vehicleProhibitionFormDefault,
  });
  const clearVehicleProhibitionForm = () => {
    vehicleProhibitionForm.value = { ...vehicleProhibitionFormDefault };
  };

  const vehicleInspectionSchedulePlan = ref(["Профиль по умолчанию"]);

  const vehicleCreateFormOtherRef = ref<FormInstance>();
  const vehicleCreateFormOtherDefault: IVehicleOtherPart = {
    tire_diameter: 15,
    company_unit: null,
    pts_number: "",
    maintenance_plan: "default",
    start_cost: null,
    inspection_profile_id: 1,
  };
  const vehicleCreateFormOther = ref<IVehicleOtherPart>({
    ...vehicleCreateFormOtherDefault,
  });
  const clearVehicleCreateFormOther = () => {
    vehicleCreateFormOther.value = { ...vehicleCreateFormOtherDefault };
  };
  const vehicleCreateFormOtherRules = computed<FormRules>(() => ({
    vehicle_type_id: [
      /* {
        required: true,
        message: "Выберите Тип автомобиля",
        trigger: "change",
      }, */
    ],
    tire_diameter: [
      /* {
        required: true,
        message: "Выберите Диаметр дисков",
        trigger: "change",
      }, */
    ],
    start_cost: [
      /* {
        required: true,
        message: "",
        trigger: "change",
      }, */
    ],
    // pts_number: [
    //   {
    //     required: true,
    //     message: "Введите Серия и номер ПТС",
    //     trigger: "change",
    //   },
    // ],
    maintenance_plan: [
      {
        /* required: true, */
        message: "Выберите План прохождения ТО",
        trigger: "change",
      },
    ],
  }));

  const defaultVehiclesRentTemplateForm: IVehicleRentTemplate = {
    id: undefined,
    name: "",
    accrual_type: "DAILY",
    first_day_off_in: 0,
    days_off: [],
    rent_cost: 0,
    franchise_cost: 0,
    deposit_cost: 0,
  };

  const vehiclesRentTemplateFormRef = ref<FormInstance>();
  const vehiclesRentTemplateFormRules = computed<FormRules>(() => {
    let rules: FormRules = {
      accrual_type: [
        {
          required: true,
          message: "Выберите Тип начисления аренды",
          trigger: "change",
        },
      ],
      rent_cost: [
        {
          required: true,
          message: "Введите стоимость аренды",
          trigger: "change",
        },
        {
          validator: checkNumberRule,
          message: "Стоимость аренды должна быть больше 0",
          trigger: "change",
        },
      ],
      first_day_off_in: [
        {
          required: true,
          message: "Введите Выходной после",
          trigger: "change",
        },
        {
          validator: checkNumberWithZeroRule,
          message: "Выходной после должен быть больше или равен 0",
          trigger: "change",
        },
      ],
      franchise_cost: [
        {
          required: true,
          message: "Введите Франшиза",
          trigger: "change",
        },
        {
          validator: checkNumberWithZeroRule,
          message: "Франшиза должна быть больше или равен 0",
          trigger: "change",
        },
      ],
      deposit_cost: [
        {
          required: true,
          message: "Введите Депозит",
          trigger: "change",
        },
        {
          validator: checkNumberWithZeroRule,
          message: "Депозит должен быть больше или равен 0",
          trigger: "change",
        },
      ],
    };

    if (route.path.split("/").includes("reference-book")) {
      rules = {
        name: [
          {
            required: true,
            message: "Выберите наименование",
            trigger: "blur",
          },
        ],
        ...rules,
      };
    }

    return rules;
  });
  const vehiclesRentTemplateForm = ref({
    ...defaultVehiclesRentTemplateForm,
  });

  const defaultVehiclesRentRedemptionForm: IVehicleRentRedemptionPart = {
    redemption_driver_id: undefined,
    redemption_amount: 0,
    redemption_expiration: undefined,
    redemption_franchise_cost: 0,
    redemption_deposit_cost: 0,
    redemption_driver_expense: false,
    rent_template_id: undefined,
    rent_amount: 0,
    periodic_debit_type: "",
  };

  const vehiclesRentRedemptionFormRef = ref<FormInstance>();
  const vehiclesRentRedemptionForm = ref({
    ...defaultVehiclesRentRedemptionForm,
  });

  const clearVehicleRentTemplateForm = () => {
    vehiclesRentTemplateForm.value = { ...defaultVehiclesRentTemplateForm };
  };

  const clearVehicleRentRedemtionForm = () => {
    vehiclesRentRedemptionForm.value = { ...defaultVehiclesRentRedemptionForm };
  };

  const clearVehicleCreateFormSTSPart = () => {
    vehicleCreateFormSTSPart.value = { ...vehicleCreateFormSTSPartDefault };
  };
  const vehicleCreateForm = computed(() => {
    return {
      ...vehicleCreateFormSTSPart.value,
    };
  });
  const serializeVehicleDataToServer = () => {
    const { company_unit, ...vehicleCreateFormOtherWithoutUnit } =
      vehicleCreateFormOther.value;
    return {
      ...vehicleCreateForm.value,
      ...vehicleCreateFormRegistrationCertificatePart.value,
      ...vehicleCreateFormDealPart.value,
      ...vehicleCreateFormLicence.value,
      ...vehicleCreateFormOther.value,
      ...vehicleCreateFormOtherWithoutUnit,
      fuel_type: vehicleCreateForm.value.fuel_type?.length
        ? vehicleCreateForm.value.fuel_type
        : undefined,
      counterparty_id: vehicleCreateForm.value.counterparty_id ?? undefined,
      sts: {
        sts_number: vehicleCreateForm.value.sts_number,
        issued_date: vehicleCreateForm.value.issued_date?.length
          ? vehicleCreateForm.value.issued_date
          : undefined,
        expires_at: vehicleCreateForm.value.expires_at?.length
          ? vehicleCreateForm.value.expires_at
          : undefined,
      },
      document_ids: allVehicleDocuments.value,
      licence_issued_date:
        vehicleCreateFormLicence.value.licence_issued_date &&
        vehicleCreateFormLicence.value.licence_issued_date != ""
          ? vehicleCreateFormLicence.value.licence_issued_date
          : null,
      licence_expires_at:
        vehicleCreateFormLicence.value.licence_expires_at &&
        vehicleCreateFormLicence.value.licence_expires_at != ""
          ? vehicleCreateFormLicence.value.licence_expires_at
          : null,
      licence_series:
        vehicleCreateFormLicence.value.licence_series &&
        vehicleCreateFormLicence.value.licence_series != ""
          ? vehicleCreateFormLicence.value.licence_series
          : null,
      start_cost: vehicleCreateFormOther.value.start_cost
        ? vehicleCreateFormOther.value.start_cost
        : 0,
      company_unit_id: vehicleCreateFormOther.value?.company_unit?.id || null,
    };
  };

  const createVehicle = async () => {
    try {
      await Promise.all([
        validatePromise(
          vehicleCreateFormSTSPartRef.value!,
          false,
          EVehicleTabKey.sts,
        ),
        validatePromise(
          vehicleCreateFormLicenceRef.value!,
          false,
          EVehicleTabKey.licence,
        ),
        validatePromise(
          vehicleCreateFormDealPartRef.value!,
          false,
          EVehicleTabKey.deal,
        ),
        validatePromise(
          vehicleCreateFormOtherRef.value!,
          false,
          EVehicleTabKey.other,
        ),
      ]);

      await createVehicleRequest({
        ...serializeVehicleDataToServer(),
        mod_spec_country: userProfile.value?.country ?? "RU",
        company_id: currentCompanyId.value,
      });
      clear();
      hideDrawer();
      ElNotification({
        title: "Успешный запрос",
        message: "Транспорт успешно добавлен",
        type: "success",
      });
    } catch (err) {
      console.error("Error in createVehicle:", err);
      throw err;
    }
  };
  const updateVehicle = async (
    {
      silent,
      withoutValidate,
    }: { silent: boolean; withoutValidate: boolean } = {
      silent: false,
      withoutValidate: false,
    },
  ) => {
    console.log("vehicleCreateFormSTSPart", vehicleCreateFormSTSPart.value);
    return (
      withoutValidate
        ? Promise.resolve()
        : Promise.all([
            validatePromise(vehicleCreateFormOtherRef.value!),
            validatePromise(vehicleCreateFormLicenceRef.value!),
            validatePromise(vehicleCreateFormDealPartRef.value!),
            validatePromise(vehicleCreateFormSTSPartRef.value!),
          ])
    ).then(async () => {
      if (
        !detailResult.value?.sts ||
        vehicleCreateForm.value.sts_number !==
          detailResult.value?.sts?.sts_number ||
        vehicleCreateForm.value.issued_date !==
          detailResult.value?.sts?.issued_date ||
        vehicleCreateForm.value.expires_at !==
          detailResult.value?.sts?.expires_at
      ) {
        if (detailResult.value?.id) {
          try {
            await updateStsRequest({
              company_id: currentCompanyId.value,
              vehicle_id: detailResult.value!.id,
              sts_number: vehicleCreateForm.value.sts_number,
              issued_date: vehicleCreateForm.value.issued_date?.length
                ? vehicleCreateForm.value.issued_date
                : undefined,
              expires_at: vehicleCreateForm.value.expires_at?.length
                ? vehicleCreateForm.value.expires_at
                : undefined,
              mod_spec_country: userProfile.value?.country ?? "RU",
            });
          } catch (err) {
            console.error({ err });
          }
        }
      }
      try {
        const { company_unit, ...vehicleCreateFormOtherWithoutUnit } =
          vehicleCreateFormOther.value;
        await updateVehicleRequest({
          ...vehicleCreateForm.value,
          ...vehicleCreateFormSTSPart.value,
          ...vehicleCreateFormRegistrationCertificatePart.value,
          ...vehicleCreateFormDealPart.value,
          ...vehicleCreateFormLicence.value,
          ...vehicleCreateFormOtherWithoutUnit,
          ...vehicleProhibitionForm.value,
          ...vehiclesRentRedemptionForm.value,
          purchase_amount:
            vehicleCreateFormDealPart.value?.purchase_amount || null,
          rent_contract_amount:
            vehicleCreateFormDealPart.value?.rent_contract_amount || null,
          leasing_amount:
            vehicleCreateFormDealPart.value?.leasing_amount || null,
          rent_template_id: detailResult.value?.rent_template_id,
          redemption_expiration: vehiclesRentRedemptionForm.value
            .redemption_expiration
            ? formatDateToServer(
                vehiclesRentRedemptionForm.value.redemption_expiration,
              )
            : undefined,
          document_ids: allVehicleDocuments.value,
          engine_power:
            vehicleCreateFormSTSPart.value.engine_power &&
            Number(vehicleCreateFormSTSPart.value.engine_power) > 0
              ? vehicleCreateFormSTSPart.value.engine_power
              : null,
          licence_issued_date:
            vehicleCreateFormLicence.value.licence_issued_date &&
            vehicleCreateFormLicence.value.licence_issued_date != ""
              ? vehicleCreateFormLicence.value.licence_issued_date
              : null,
          licence_expires_at:
            vehicleCreateFormLicence.value.licence_expires_at &&
            vehicleCreateFormLicence.value.licence_expires_at != ""
              ? vehicleCreateFormLicence.value.licence_expires_at
              : null,
          licence_series:
            vehicleCreateFormLicence.value.licence_series &&
            vehicleCreateFormLicence.value.licence_series != ""
              ? vehicleCreateFormLicence.value.licence_series
              : null,
          start_cost: vehicleCreateFormOther.value.start_cost
            ? vehicleCreateFormOther.value.start_cost
            : 0,
          mod_spec_country: userProfile.value?.country ?? "RU",
          company_unit_id:
            vehicleCreateFormOther.value?.company_unit?.id || null,
        });
        if (!silent) hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Транспорт успешно обновлен",
          type: "success",
        });
      } catch (e) {}
    });
  };

  const clear = () => {
    clearVehicleCreateFormSTSPart();
    clearVehicleFilesLists();
    clearVehicleCreateFormLicence();
    clearVehicleCreateFormOther();
    clearVehicleProhibitionForm();
  };

  const saveVehicle = () => {
    if (vehicleCreateForm.value.id) {
      updateVehicle();
    } else {
      createVehicle();
    }
  };

  const vehicleTotalItems = computed(
    () => vehiclesResponse.value?.total_items ?? 0,
  );
  const vehicleDetailsId = computed(() => {
    const id = route.hash?.split("/")[2];
    return id ? Number(id) : undefined;
  });

  watch(updateVehicleError, (v) => {
    ElNotification({
      title: v?.title,
      message: v?.message,
      type: "error",
    });
  });

  watch(createVehicleError, (v) => {
    ElNotification({
      title: v?.title,
      message: v?.message,
      type: "error",
    });
  });

  watch(detailResult, (v) => {
    if (v) {
      clear();
      setVehiclesFormsData(v);
      vehicleStsHistoryRequest({
        company_id: currentCompanyId.value,
        vehicle_id: v.id!,
      });
    }
  });

  watch(
    () => vehicleCreateForm.value.id,
    async (v) => {
      if (v) {
        if (vehicleCreateForm.value.id) {
          setInspectionsScheduleVehicle(vehicleCreateForm.value.id);
        }
      }
    },
    { immediate: true },
  );

  watch(
    () => route.hash,
    (v) => {
      if (v === EDrawerRouteHash.VehicleCreate) {
        if (Boolean(selectedDraftVehicle.value) || Boolean(newDraft.value)) {
          return;
        }
        clear();
      }
      // console.log({ v });
      // if (v === EDrawerRouteHash.VehicleCreate) {
      //   clear();
      // }
      // if (v?.includes(EDrawerRouteHash.VehicleDetails)) {
      //   fetchDetail({
      //     company_id: 3,
      //     vehicle_id: Number(v.split("/")[2]),
      //   });
      // }
      return;
    },
    { immediate: true },
  );

  const setVehiclesFormsData = (v: IVehicle) => {
    // DEAL PART
    try {
      vehicleCreateFormDealPart.value.company_id =
        v.company?.id ?? currentCompanyId.value;
      vehicleCreateFormDealPart.value.possession_status = v.possession_status;
      vehicleCreateFormDealPart.value.purchase_amount = v.purchase_amount;
      vehicleCreateFormDealPart.value.purchase_date = v.purchase_date;
      vehicleCreateFormDealPart.value.second_key_location =
        v.second_key_location;
      vehicleCreateFormDealPart.value.leasing_amount = v.leasing_amount;
      vehicleCreateFormDealPart.value.leasing_company = v.leasing_company;
      vehicleCreateFormDealPart.value.leasing_contract_number =
        v.leasing_contract_number;
      vehicleCreateFormDealPart.value.leasing_contract_date_issued =
        v.leasing_contract_date_issued;
      vehicleCreateFormDealPart.value.leasing_contract_date_end =
        v.leasing_contract_date_end;
      vehicleCreateFormDealPart.value.disposal = v.disposal;
      vehicleCreateFormDealPart.value.disposal_date = v.disposal_date;
      vehicleCreateFormDealPart.value.disposal_reason = v.disposal_reason;
      vehicleCreateFormDealPart.value.disposal_sales_amount =
        v.disposal_sales_amount;
      vehicleCreateFormDealPart.value.rent_contract_amount =
        v.rent_contract_amount;
      vehicleCreateFormDealPart.value.rent_contract_renter =
        v.rent_contract_renter;
      vehicleCreateFormDealPart.value.rent_contract_number =
        v.rent_contract_number;
      vehicleCreateFormDealPart.value.rent_contract_date_issued =
        v.rent_contract_date_issued;
      vehicleCreateFormDealPart.value.rent_contract_date_end =
        v.rent_contract_date_end;
    } catch (err) {
      console.error({ err });
    }

    // STS PART
    try {
      vehicleCreateFormSTSPart.value.comment = v.comment;
      vehicleCreateFormSTSPart.value.id = v.id;
      vehicleCreateFormSTSPart.value.vin = v.vin;
      vehicleCreateFormSTSPart.value.plate_number = v.plate_number;
      vehicleCreateFormSTSPart.value.body_number = v.body_number;
      vehicleCreateFormSTSPart.value.engine_number = v.engine_number;
      vehicleCreateFormSTSPart.value.manufacture_year = v.manufacture_year;
      vehicleCreateFormSTSPart.value.vehicle_data_sheet_number =
        v.vehicle_data_sheet_number;
      vehicleCreateFormSTSPart.value.engine_horsepower = v.engine_horsepower;
      vehicleCreateFormSTSPart.value.fullname = v.fullname;
      vehicleCreateFormSTSPart.value.engine_power =
        v.engine_power && Number(v.engine_power) > 0
          ? v.engine_power
          : undefined;
      vehicleCreateFormSTSPart.value.company_id = v.company_id;
      vehicleCreateFormSTSPart.value.counterparty_id = v.counterparty_id ?? 0;
      vehicleCreateFormSTSPart.value.brand_id = v.brand_id;
      vehicleCreateFormSTSPart.value.car_model_id = v.car_model_id;
      vehicleCreateFormSTSPart.value.color_id = v.color?.id;
      vehicleCreateFormSTSPart.value.fuel_type = v.fuel_type?.length
        ? v.fuel_type
        : undefined;
      vehicleCreateFormSTSPart.value.manufacture_year =
        v.manufacture_year != null ? v.manufacture_year.toString() : null;
      vehicleCreateFormSTSPart.value.issued_date = v.sts?.issued_date ?? "";
      vehicleCreateFormSTSPart.value.expires_at = v.sts?.expires_at ?? "";
    } catch (err) {
      console.error({ err });
    }

    try {
      if (v.counterparty)
        vehicleCreateFormSTSPart.value.counterparty_id = v.counterparty.id;
    } catch (err) {
      console.error({ err });
    }

    try {
      vehicleCreateFormSTSPart.value.color_id = v.color?.id;
      vehicleCreateFormSTSPart.value.car_model_id = v.car_model?.id;
      vehicleCreateFormSTSPart.value.brand_id = v.brand?.id;
    } catch (err) {
      console.error({ err });
    }
    if (v.sts) {
      // const stsKeys = Object.keys(vehicleCreateFormSTSPart).filter(
      //   (key) => key in v.sts!
      // ) as (keyof IVehicleSts & keyof IVehicleFormSTSPart)[];

      // stsKeys.forEach((key) => {
      //   if (v.sts && v.sts[key]) {
      //     vehicleCreateFormSTSPart.value[key] = v.sts[key] as never;
      //   }
      // });
      try {
        vehicleCreateFormSTSPart.value.sts_number = v.sts?.sts_number;
        vehicleCreateFormSTSPart.value.issued_date = v.sts?.issued_date;
        vehicleCreateFormSTSPart.value.expires_at = v.sts?.expires_at;
      } catch (err) {
        console.error({ err });
      }
    }

    // OTHER PART
    try {
      vehicleCreateFormOther.value.vehicle_type_id = v.vehicle_type?.id;
      vehicleCreateFormOther.value.tire_diameter = v.tire_diameter;
      vehicleCreateFormOther.value.company_unit = v.company_unit;
      vehicleCreateFormOther.value.pts_number = v.pts_number;
      vehicleCreateFormOther.value.maintenance_plan = v.maintenance_plan;
      vehicleCreateFormOther.value.start_cost = v.start_cost;
      vehicleCreateFormOther.value.inspection_profile_id =
        v.inspection_profile_id;
    } catch (err) {
      console.error({ err });
    }

    // LICENCE PART
    try {
      vehicleCreateFormLicence.value.licence_series = v.licence_series;
      vehicleCreateFormLicence.value.licence_issued_date =
        v.licence_issued_date;
      vehicleCreateFormLicence.value.licence_expires_at = v.licence_expires_at;
    } catch (err) {
      console.error({ err });
    }

    // ISSUANCE PROHIBITION PART
    try {
      vehicleProhibitionForm.value.issuance_prohibition =
        v.issuance_prohibition;
      vehicleProhibitionForm.value.issuance_prohibition_reason =
        v.issuance_prohibition_reason;
    } catch (err) {
      console.error({ err });
    }

    allVehicleDocuments.value = v.document_ids?.length
      ? [...v.document_ids]
      : [];
    // (Object.keys(licenceFormPart) as (keyof t.IDriverLicence)[]).forEach(
    //   (key) => {
    //     licenceFormPart[key] = v.licence[key] as never;
    //   }
    // );
    vehiclesRentRedemptionForm.value.periodic_debit_type =
      v.periodic_debit_type;
    vehiclesRentRedemptionForm.value.redemption_amount = v.redemption_amount;
    vehiclesRentRedemptionForm.value.redemption_driver_expense =
      v.redemption_driver_expense ?? false;
    vehiclesRentRedemptionForm.value.redemption_driver_id =
      v.redemption_driver_id;
    vehiclesRentRedemptionForm.value.redemption_expiration =
      v.redemption_expiration;
    vehiclesRentRedemptionForm.value.redemption_franchise_cost =
      Number(v.redemption_franchise_cost ?? 0) ?? 0;
    vehiclesRentRedemptionForm.value.redemption_deposit_cost =
      Number(v.redemption_deposit_cost ?? 0) ?? 0;
    vehiclesRentRedemptionForm.value.rent_amount = v.rent_amount;
    vehiclesRentRedemptionForm.value.rent_template_id = v.rent_template_id;
  };

  const getVehicleShortCardInfo = (
    vehicle: IVehicle | undefined,
    inspection: IInspections[] | undefined,
  ) => {
    if (!vehicle) return [];

    return [
      {
        label: "Пробег",
        value: `${vehicle.last_inspection_mileage || 0} км`,
      },
      {
        label: "Бензин",
        value: inspection?.length
          ? getInspectionFuelLevelLabel(inspection[0]?.fuel_left)
          : "-",
      },
      {
        label: "ТО через",
        value: "950 км",
      },
      {
        label: "ОСАГО до",
        value: vehicle?.osago?.expires_at
          ? formatDay(vehicle.osago.expires_at)
          : "-",
      },
      {
        label: "Техосмотр до",
        value: vehicle?.last_diagnostic_card?.expires_at
          ? formatDay(vehicle.last_diagnostic_card.expires_at)
          : "-",
      },
      {
        label: "Лицензия до",
        value: vehicle?.licence_expires_at
          ? formatDay(vehicle.licence_expires_at)
          : "-",
      },
    ];
  };

  const setInspectionsScheduleVehicle = async (
    vehicle_id: number,
  ): Promise<void> => {
    try {
      await fetchInspectionsScheduleVehicleList({
        vehicle_id,
        company_id: currentCompanyId.value,
      });

      vehicleInspectionSchedulePlan.value = [
        inspectionsScheduleVehicle?.value?.name,
      ];
    } catch (e) {}
  };

  const downloadVehicles = async (
    params: IFetchVehiclesParams,
  ): Promise<void> => {
    const { disposal } = params;
    try {
      const params = new URLSearchParams();
      currentCompaniesIdsList.value.forEach((id) => {
        params.append("company_ids", String(id));
      });
      if (disposal) params.append("disposal", String(disposal));

      const result = await axios.get(
        `${MAIN_ENDPOINT}api/v1/vehicles/vehicles/report`,
        {
          params,
          responseType: "blob",
        },
      );

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `vehicle_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Список автомобилей получен",
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

  const {
    loading: fetchVehicleIntegrationsLoading,
    response: vehicleIntegrationsResponse,
    request: fetchVehicleIntegrations,
  } = useApi<IPagination<IVehicleIntegration>, IVehicleIntegrationsListParams>({
    dynamicUrl: (p) => `/api/v1/integrations_vehicle/${p.vehicle_id}`,
    method: "GET",
  });

  const {
    loading: createVehicleIntegrationLoading,
    error: createVehicleIntegrationError,
    response: newVehicleIntegration,
    request: createVehicleIntegrationRequest,
  } = useApi<
    IVehicleIntegration,
    IVehicleIntegrationCreateForm & { vehicle_id: number }
  >({
    dynamicUrl: (p) => `/api/v1/integrations_vehicle/${p.vehicle_id}`,
    method: "POST",
  });

  const {
    loading: updateVehicleIntegrationLoading,
    error: updateVehicleIntegrationError,
    response: updatedVehicleIntegration,
    request: updateVehicleIntegrationRequest,
  } = useApi<
    IVehicleIntegration,
    IVehicleIntegrationUpdateForm & IVehicleIntegrationDetailParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/integrations_vehicle/${p.vehicle_id}/${p.integration_vehicle_id}`,
    method: "PUT",
  });

  const {
    loading: deleteVehicleIntegrationLoading,
    error: deleteVehicleIntegrationError,
    request: deleteVehicleIntegrationRequest,
  } = useApi<void, IVehicleIntegrationDetailParams>({
    dynamicUrl: (p) =>
      `/api/v1/integrations_vehicle/${p.vehicle_id}/${p.integration_vehicle_id}`,
    method: "DELETE",
  });

  return {
    vehicles,
    detailResult,
    vehicleDetailsId,
    vehicleCreateFormSTSPart,
    vehicleCreateFormSTSPartRef,
    vehicleCreateFormRegistrationCertificatePart,
    vehicleCreateForm,
    isFetchVehiclesLoading,
    isCreateVehicleLoading,

    vehicleCreateFormDealPartRef,
    vehicleCreateFormDealPart,
    vehicleCreateFormDealPartRules,

    vehicleCreateFormLicenceRef,
    vehicleCreateFormLicence,
    vehicleCreateFormLicenceRules,

    vehicleCreateFormOtherRef,
    vehicleCreateFormOther,
    vehicleCreateFormOtherRules,

    vehicleTotalItems,

    createVehicleResponse,
    updateVehicleResponse,

    vehicleProhibitionForm,

    vehiclesRentTemplateFormRef,
    vehiclesRentTemplateFormRules,
    vehiclesRentTemplateForm,
    vehiclesRentRedemptionFormRef,
    vehiclesRentRedemptionForm,
    clearVehicleRentTemplateForm,
    clearVehicleRentRedemtionForm,

    stsFileList,
    ptsFileList,
    extraFileList,
    allVehicleDocuments,
    uploadStsFileList,
    uploadPtsFileList,
    uploadExtraFileList,
    handleRemoveVehicleFile,
    getVehicleDocsByType,

    fetchDetail,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    updateVehicleRequest,
    saveVehicle,
    clear,

    downloadVehicles,

    getVehicleShortCardInfo,
    serializeVehicleDataToServer,
    setVehiclesFormsData,

    vehicleInspectionSchedulePlan,

    vehicleStsHistoryResult,
    vehicleStsHistoryLoading,

    fetchVehicleIntegrations,
    fetchVehicleIntegrationsLoading,
    vehicleIntegrationsResponse,
    createVehicleIntegrationRequest,
    createVehicleIntegrationLoading,
    createVehicleIntegrationError,
    updateVehicleIntegrationRequest,
    updateVehicleIntegrationLoading,
    updateVehicleIntegrationError,
    deleteVehicleIntegrationRequest,
    deleteVehicleIntegrationLoading,
    deleteVehicleIntegrationError,
  };
};

//Insurance

export const useVehiclesInsurance = () => {
  const {
    response: vehicleInsurancesResponce,
    loading: fetchVehicleInsurancesLoading,
    request: fetchVehicleInsurances,
  } = useApi<IVehicleInsurance[], IVehicleInsurancesParams>({
    dynamicUrl: (p) => `/api/v1/vehicles/insurances/${p.vehicle_id}`,
    method: "GET",
  });
  const {
    response: newInsurance,
    loading: addInsuranceLoading,
    request: addInsuranceRequest,
    error: addInsuranceError,
  } = useApi<IVehicleInsurance, IVehicleInsuranceAddParams>({
    method: "PUT",
    dynamicUrl: (p) =>
      `/api/v1/vehicles/insurance/${p.vehicle_id}?company_id=${p.company_id}`,
  });

  const {
    response: updateInsurance,
    loading: updateInsuranceLoading,
    request: updateInsuranceRequest,
    error: updateInsuranceError,
  } = useApi<
    IVehicleInsurance,
    {
      vehicle_id: number;
      company_id: number;
      history_id: number;
      form: IVehicleInsuranceForm;
    }
  >({
    method: "PUT",
    dynamicUrl: (p) =>
      `/api/v1/vehicles/insurance/${p.vehicle_id}/${p.history_id}?company_id=${p.company_id}`,
  });

  const {
    response: deletedInsurance,
    loading: deleteInsuranceLoading,
    request: deleteInsuranceRequest,
    error: deleteInsuranceError,
  } = useApi<IVehicleInsurance, { history_id: number; company_id: number }>({
    method: "DELETE",
    dynamicUrl: (p) => `/api/v1/vehicles/insurance/${p.history_id}`,
  });

  const {
    response: updateInsuranceDocuments,
    loading: updateInsuranceDocumentsLoading,
    request: updateInsuranceDocumentsRequest,
    error: updateInsuranceDocumentsError,
  } = useApi<{ insurance_id: number; document_ids: number[] }>({
    dynamicUrl: (p) => `/api/v1/vehicles/insurance/${p.insurance_id}/documents`,
    method: "PUT",
  });

  const { uploadFileList, downloadFile } = useFiles();

  const insuranceFormDefault: IVehicleInsuranceForm = {
    issued_by_id: undefined,
    insurance_amount: "",
    insurance_number: "",
    insurance_type: undefined,
    issued_date: "",
    description: "",
    expires_at: "",
    document_ids: [],
  };

  const insuranceForm = ref({ ...insuranceFormDefault });
  const insuranceFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const clearForm = () => {
    insuranceForm.value = { ...insuranceFormDefault };
    insuranceFileList.value = [];
  };

  const vehicleInsurances = computed(() => {
    return (
      vehicleInsurancesResponce.value?.map((v) => ({
        ...v,
        issued_date: formatDay(v.issued_date),
        expires_at: formatDay(v.expires_at),
      })) ?? []
    );
  });

  const pendingFiles = ref<UploadUserFile[]>([]);
  let uploadTimeout: any = null;

  const uploadInsuranceList = (
    _file: UploadFile,
    fileList: UploadUserFile[],
    update: boolean = false,
  ) => {
    // Выбираем только новые файлы
    const newFiles = fileList.filter((f) => !(f as any).id);

    // Добавляем только новые файлы, которых ещё нет в буфере
    newFiles.forEach((f) => {
      if (!pendingFiles.value.includes(f)) {
        pendingFiles.value.push(f);
      }
    });

    // Если таймер есть — сбрасываем
    if (uploadTimeout) clearTimeout(uploadTimeout);

    // Запускаем дебаунс — ждём пока пользователь закончит выбрасывать файлы
    uploadTimeout = setTimeout(async () => {
      if (!pendingFiles.value.length) return;

      const uploaded = await uploadFileList(
        pendingFiles.value,
        "INSURANCE_DOCUMENT",
      );

      if (uploaded?.length) {
        insuranceForm.value.document_ids = [
          ...insuranceForm.value.document_ids,
          ...uploaded.map((f) => f.id),
        ];

        insuranceFileList.value = [
          ...insuranceFileList.value.filter((f) => (f as any).id),
          ...uploaded,
        ];
      }

      // Очищаем буфер
      pendingFiles.value = [];
    }, 300);
  };

  const handleRemoveInsuranceFile: UploadProps["onRemove"] = async (
    uploadFile,
  ) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      insuranceForm.value.document_ids =
        insuranceForm.value.document_ids.filter((f) => f !== id);
    insuranceFileList.value = insuranceFileList.value.filter(
      (f) => f.id !== id,
    );
  };

  return {
    vehicleInsurances,
    newInsurance,
    deletedInsurance,
    updateInsurance,
    fetchVehicleInsurancesLoading,
    addInsuranceLoading,
    deleteInsuranceLoading,
    updateInsuranceLoading,
    addInsuranceError,
    deleteInsuranceError,
    updateInsuranceError,

    fetchVehicleInsurances,
    addInsuranceRequest,
    updateInsuranceRequest,
    deleteInsuranceRequest,
    insuranceForm,
    clearForm,

    insuranceFileList,
    uploadInsuranceList,
    handleRemoveInsuranceFile,
  };
};

// Miliage

export const useVehiclesMileage = () => {
  const {
    response: vehiclesMileageResponse,
    loading: fetchVehiclesMileageLoading,
    request: fetchVehiclesMileage,
  } = useApi<IMileageFetchResponse, IVehicleMileageParams>({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/mileage`,
    method: "GET",
  });
  const {
    response: addVehiclesMileageResponse,
    loading: addVehiclesMileageLoading,
    request: addVehiclesMileageRequest,
    error: addVehiclesMileageError,
  } = useApi<IVehicleMileage, { vehicle_id: number }>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/mileage`,
  });

  const miliageFormDefault: IVehicleMileageForm = {
    mileage: null,
  };

  const mileageForm = ref({ ...miliageFormDefault });
  const mileageFormRef = ref<FormInstance>();
  const firstMileageCurrent = ref<IVehicleMileage | null>(null);
  const mileageFormRules = computed<FormRules>(() => {
    let rules: FormRules = {
      mileage: [
        {
          required: true,
          message: "Укажите пробег",
          trigger: "change",
        },
        {
          validator: (_rule, value, callback) => {
            if (value === null || value === undefined || value === "") {
              return callback(new Error("Пробег не может быть пустым"));
            }

            const first = firstMileageCurrent.value?.mileage;
            if (first != null && value < first) {
              return callback(
                new Error(`Пробег не может быть меньше ${first} км`),
              );
            }

            return callback();
          },
          trigger: ["blur"],
        },
      ],
    };

    return rules;
  });

  const clearForm = () => {
    mileageForm.value = { ...miliageFormDefault };
  };

  const vehicleMileage = computed(() => {
    const result = vehiclesMileageResponse.value?.items ?? [];

    if (!firstMileageCurrent.value) {
      const trustedItem = result.find((item) => item.trusted === true);
      firstMileageCurrent.value = trustedItem ?? null;
    }
    return result;
  });

  const vehicleMileageTotalItems = computed(() => {
    return vehiclesMileageResponse.value?.total_items ?? 0;
  });

  return {
    mileageForm,
    mileageFormRef,
    mileageFormRules,

    vehicleMileage,
    vehicleMileageTotalItems,
    fetchVehiclesMileageLoading,
    fetchVehiclesMileage,

    addVehiclesMileageResponse,
    addVehiclesMileageLoading,
    addVehiclesMileageRequest,
    addVehiclesMileageError,

    firstMileageCurrent,

    clearForm,
  };
};

export const useVehiclesDiagnosticCards = () => {
  const {
    response: vehicleDiagnosticCardsResponce,
    loading: fetchVehicleDiagnosticCardsLoading,
    request: fetchVehicleDiagnosticCards,
  } = useApi<
    IPagination<IVehicleDiagnosticCard>,
    IVehicleDiagnosticCardsListParams
  >({
    dynamicUrl: (p) => `/api/v1/diagnostic_cards/${p.vehicle_id}`,
    method: "GET",
  });
  const {
    response: newDiagnosticCard,
    loading: addDiagnosticCardLoading,
    request: addDiagnosticCardRequest,
    error: addDiagnosticCardError,
  } = useApi<IVehicleDiagnosticCard, IVehicleDiagnosticCardAddParams>({
    method: "POST",
    dynamicUrl: (p) => `/api/v1/diagnostic_cards/${p.vehicle_id}`,
  });
  const {
    response: updateDiagnosticCard,
    loading: updateDiagnosticCardLoading,
    request: updateDiagnosticCardRequest,
    error: updateDiagnosticCardError,
  } = useApi<
    IVehicleDiagnosticCard,
    {
      vehicle_id: number;
      diagnostic_card_id: number;
      form: IVehicleDiagnosticCardForm;
    }
  >({
    method: "PUT",
    dynamicUrl: (p) =>
      `/api/v1/diagnostic_cards/${p.vehicle_id}/${p.diagnostic_card_id}`,
  });
  const {
    response: deletedDiagnosticCard,
    loading: deleteDiagnosticCardLoading,
    request: deleteDiagnosticCardRequest,
    error: deleteDiagnosticCardError,
  } = useApi<IVehicleDiagnosticCard, IVehicleDiagnosticCardRemoveParams>({
    method: "DELETE",
    dynamicUrl: (p) =>
      `/api/v1/diagnostic_cards/${p.vehicle_id}/${p.diagnostic_card_id}`,
  });

  const diagnosticCardFormDefault = reactive<IVehicleDiagnosticCardForm>({
    registration_number: "",
    issued_date: "",
    expires_at: "",
  });

  const diagnosticCardForm = ref({ ...diagnosticCardFormDefault });

  const clearForm = () => {
    diagnosticCardForm.value = { ...diagnosticCardFormDefault };
  };

  const vehicleDiagnosticCards = computed(() => {
    return (
      vehicleDiagnosticCardsResponce.value?.items?.map((v) => ({
        ...v,
        issued_date: formatDay(v.issued_date),
        expires_at: formatDay(v.expires_at),
      })) ?? []
    );
  });
  const vehicleDiagnosticCardsTotalItems = computed(
    () => vehicleDiagnosticCardsResponce.value?.total_items ?? 0,
  );

  return {
    vehicleDiagnosticCards,
    vehicleDiagnosticCardsTotalItems,
    newDiagnosticCard,
    deletedDiagnosticCard,
    updateDiagnosticCard,

    addDiagnosticCardLoading,
    fetchVehicleDiagnosticCardsLoading,
    deleteDiagnosticCardLoading,
    updateDiagnosticCardLoading,

    addDiagnosticCardError,
    deleteDiagnosticCardError,
    updateDiagnosticCardError,

    fetchVehicleDiagnosticCards,
    addDiagnosticCardRequest,
    deleteDiagnosticCardRequest,
    updateDiagnosticCardRequest,
    diagnosticCardForm,
    clearForm,
  };
};

// leasing

export const useVehiclesLeasings = () => {
  const {
    response: vehicleLeasingsResponse,
    loading: vehicleLeasingsLoading,
    request: fetchLeasings,
  } = useApi<IPagination<IVehicleLeasing>, IFetchVehiclesParams>({
    url: "/api/v1/leasing",
    method: "GET",
  });
  const {
    response: vehicleLeasingsWidgetResponse,
    loading: vehicleLeasingsWidgetLoading,
    request: fetchLeasingsWidget,
  } = useApi<IVehicleLeasingWidget>({
    url: "/api/v1/leasing/widget",
    method: "GET",
  });
  const {
    response: vehicleOneLeasingResponce,
    loading: vehicleOneLeasingLoading,
    request: fetchVehicleOneLeasing,
    error: errorVehicleOneLeasing,
  } = useApi<IVehicleLeasing, { leasing_contract_id: string }>({
    dynamicUrl: (p) => `/api/v1/leasing/${p.leasing_contract_id}`,
    method: "GET",
  });
  const {
    response: leasingSchedulePaymentsResponse,
    loading: leasingSchedulePaymentsLoading,
    request: fetchLeasingSchedulePayments,
  } = useApi<IVehicleLeasingSchedulePayment[], { leasing_contract_id: string }>(
    {
      dynamicUrl: (p) =>
        `/api/v1/leasing/${p.leasing_contract_id}/schedule_payments`,
      method: "GET",
    },
  );
  const {
    response: leasingOneSchedulePaymentResponse,
    loading: leasingOneSchedulePaymentLoading,
    request: fetchLeasingOneSchedulePayment,
  } = useApi<
    IVehicleLeasingSchedulePayment,
    { leasing_contract_id: string; leasing_schedule_payment_id: string }
  >({
    dynamicUrl: (p) =>
      `/api/v1/leasing/${p.leasing_contract_id}/schedule_payments/${p.leasing_schedule_payment_id}`,
    method: "GET",
  });
  const {
    response: leasingActualPaymentsResponse,
    loading: leasingActualPaymentsLoading,
    request: fetchLeasingActualPayments,
  } = useApi<IVehicleLeasingActualPayment[], { leasing_contract_id: string }>({
    dynamicUrl: (p) =>
      `/api/v1/leasing/${p.leasing_contract_id}/actual_payments`,
    method: "GET",
  });
  const {
    response: newLeasing,
    loading: addLeasingLoading,
    request: addLeasingRequest,
    error: addLeasingError,
  } = useApi<IVehicleLeasingForm>({
    url: "/api/v1/leasing",
    method: "POST",
  });
  const {
    response: newLeasingActual,
    loading: addLeasingActualLoading,
    request: addLeasingActualRequest,
    error: addLeasingActualError,
  } = useApi<IVehicleLeasingActualPaymentForm, { leasing_contract_id: string }>(
    {
      dynamicUrl: (p) =>
        `/api/v1/leasing/${p.leasing_contract_id}/actual_payments`,
      method: "POST",
    },
  );
  const {
    response: newLeasingSchedule,
    loading: addLeasingScheduleLoading,
    request: addLeasingScheduleRequest,
    error: addLeasingScheduleError,
  } = useApi<
    IVehicleLeasingSchedulePaymentForm,
    { leasing_contract_id: string }
  >({
    dynamicUrl: (p) =>
      `/api/v1/leasing/${p.leasing_contract_id}/schedule_payments`,
    method: "POST",
  });
  const {
    response: updateLeasingSchedule,
    loading: updateLeasingScheduleLoading,
    request: updateLeasingScheduleRequest,
    error: updateLeasingScheduleError,
  } = useApi<
    IVehicleLeasingSchedulePaymentForm,
    { leasing_contract_id: string; leasing_schedule_payment_id: string }
  >({
    dynamicUrl: (p) =>
      `/api/v1/leasing/${p.leasing_contract_id}/schedule_payments/${p.leasing_schedule_payment_id}`,
    method: "PUT",
  });
  const {
    response: deleteLeasingSchedule,
    loading: deleteLeasingScheduleLoading,
    request: deleteLeasingScheduleRequest,
    error: deleteLeasingScheduleError,
  } = useApi<{
    leasing_contract_id: string;
    leasing_schedule_payment_id: string;
  }>({
    dynamicUrl: (p) =>
      `/api/v1/leasing/${p.leasing_contract_id}/schedule_payments/${p.leasing_schedule_payment_id}`,
    method: "DELETE",
  });
  const {
    response: changeStatusLeasing,
    loading: changeStatusLeasingLoading,
    request: changeStatusLeasingRequest,
    error: changeStatusLeasingError,
  } = useApi<{
    leasing_contract_id: string;
    status: string;
    closed_reason?: string;
  }>({
    dynamicUrl: (p) => `/api/v1/leasing/${p.leasing_contract_id}/status`,
    method: "POST",
  });
  const {
    response: updateLeasingDocuments,
    loading: updateLeasingDocumentsLoading,
    request: updateLeasingDocumentsRequest,
    error: updateLeasingDocumentsError,
  } = useApi<{ leasing_contract_id: number; document_ids: number[] }>({
    dynamicUrl: (p) => `/api/v1/leasing/${p.leasing_contract_id}/documents`,
    method: "PUT",
  });

  const initLeasingContractsParams: IFetchVehiclesParams = {
    page: 1,
    limit: 10,
    vehicles_ids: [] as number[],
    contracts_ids: [] as number[],
    statuses: [] as TLeasingStatus[],
  };

  const leasingContractsParams = ref({
    ...initLeasingContractsParams,
  });

  const leasingFormDefault = reactive<IVehicleLeasingForm>({
    lessor_id: undefined,
    lessee_id: undefined,
    vehicle_id: null,
    number: "",
    start_date: "",
    end_date: "",
    total_amount: null,
    down_payment: null,
    payment_day: undefined,
    payment_periodic_amount: null,
    document_ids: [],
  });

  const { uploadFileList } = useFiles();

  const leasingForm = ref({ ...leasingFormDefault });
  const leasingFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const clearForm = () => {
    leasingForm.value = { ...leasingFormDefault };
    leasingFileList.value = [];
  };

  const vehicleLeasings = computed(() => {
    return vehicleLeasingsResponse.value?.items ?? [];
  });
  const vehicleLeasingsTotalItems = computed(
    () => vehicleLeasingsResponse.value?.total_items ?? 0,
  );

  const leasingSchedulePaymentFormDefault =
    reactive<IVehicleLeasingSchedulePaymentForm>({
      amount: null,
      month: "",
      payment_date: "",
      status: undefined,
    });

  const leasingSchedulePaymentForm = ref({
    ...leasingSchedulePaymentFormDefault,
  });

  const clearFormLeasingSchedulePayment = () => {
    leasingSchedulePaymentForm.value = { ...leasingSchedulePaymentFormDefault };
  };

  watch(leasingOneSchedulePaymentResponse, (v) => {
    if (v) {
      clearFormLeasingSchedulePayment();
      leasingSchedulePaymentForm.value.amount = v.amount;
      leasingSchedulePaymentForm.value.month = v.month;
      leasingSchedulePaymentForm.value.payment_date = v.payment_date;
      leasingSchedulePaymentForm.value.status = v.status;
    }
  });

  const leasingActualPaymentFormDefault =
    reactive<IVehicleLeasingActualPaymentForm>({
      schedule_payment_id: undefined,
      amount: "",
    });

  const leasingActualPaymentForm = ref({
    ...leasingActualPaymentFormDefault,
  });

  const clearFormLeasingActualPayment = () => {
    leasingActualPaymentForm.value = { ...leasingActualPaymentFormDefault };
  };

  const getLeasingStatus = (status: TLeasingStatus) => {
    switch (status) {
      case "CANCELED":
        return "Закрыт";
      case "NOT_PAID":
        return "Активный";
      case "PAID":
        return "Выплачен";
      default:
        return "";
    }
  };

  const getLeasingStatusColor = (status: string) => {
    switch (status) {
      case "CANCELED":
        return "#F56C6C";
      case "NOT_PAID":
        return "#67C23A";
      case "PAID":
        return "#909399";
      default:
        break;
    }
  };

  const getLeasingScheduleStatus = (status: TLeasingStatus) => {
    switch (status) {
      case "NOT_PAID":
        return "Не оплачено";
      case "PAID":
        return "Оплачено";
      case "OVERDUE":
        return "Просрочено";
      default:
        return "";
    }
  };

  const getLeasingScheduleStatusColor = (status: string) => {
    switch (status) {
      case "NOT_PAID":
        return "#909399";
      case "PAID":
        return "#67C23A";
      case "OVERDUE":
        return "#F56C6C";
      default:
        return;
    }
  };

  const pendingFiles = ref<UploadUserFile[]>([]);
  let uploadTimeout: any = null;

  const uploadLeasingContractList = (
    _file: UploadFile,
    fileList: UploadUserFile[],
    update: boolean = false,
  ) => {
    // Выбираем только новые файлы
    const newFiles = fileList.filter((f) => !(f as any).id);

    // Добавляем только новые файлы, которых ещё нет в буфере
    newFiles.forEach((f) => {
      if (!pendingFiles.value.includes(f)) {
        pendingFiles.value.push(f);
      }
    });

    // Если таймер есть — сбрасываем
    if (uploadTimeout) clearTimeout(uploadTimeout);

    // Запускаем дебаунс — ждём пока пользователь закончит выбрасывать файлы
    uploadTimeout = setTimeout(async () => {
      if (!pendingFiles.value.length) return;

      const uploaded = await uploadFileList(
        pendingFiles.value,
        "LEASING_CONTRACT",
      );

      if (uploaded?.length) {
        leasingForm.value.document_ids = [
          ...leasingForm.value.document_ids,
          ...uploaded.map((f) => f.id),
        ];

        leasingFileList.value = [
          ...leasingFileList.value.filter((f) => (f as any).id),
          ...uploaded,
        ];

        if (update) {
          try {
            await updateLeasingDocumentsRequest({
              leasing_contract_id: vehicleOneLeasingResponce.value!.id,
              document_ids: leasingForm.value.document_ids,
            });

            ElNotification({
              title: "Успешный запрос",
              message: "Документы изменены",
              type: "success",
            });
          } catch (e) {
            console.error({ e });
            ElNotification({
              title: updateLeasingDocumentsError.value?.title ?? "Ошибка",
              message:
                updateLeasingDocumentsError.value?.message ??
                "Произошла ошибка, обратитесь к администратору",
              type: "error",
            });
          }
        }
      }

      // Очищаем буфер
      pendingFiles.value = [];
    }, 300);
  };

  const handleRemoveLeasingFile: UploadProps["onRemove"] = async (
    uploadFile,
  ) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      leasingForm.value.document_ids = leasingForm.value.document_ids.filter(
        (f) => f !== id,
      );
    leasingFileList.value = leasingFileList.value.filter((f) => f.id !== id);

    try {
      await updateLeasingDocumentsRequest({
        leasing_contract_id: vehicleOneLeasingResponce.value!.id,
        document_ids: leasingForm.value.document_ids,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Документы изменены",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: updateLeasingDocumentsError.value?.title ?? "Ошибка",
        message:
          updateLeasingDocumentsError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  return {
    leasingContractsParams,
    initLeasingContractsParams,

    fetchLeasings,
    vehicleLeasingsLoading,
    vehicleLeasings,
    vehicleLeasingsTotalItems,

    fetchVehicleOneLeasing,
    vehicleOneLeasingResponce,
    vehicleOneLeasingLoading,

    fetchLeasingSchedulePayments,
    leasingSchedulePaymentsResponse,
    leasingSchedulePaymentsLoading,

    leasingOneSchedulePaymentResponse,
    leasingOneSchedulePaymentLoading,
    fetchLeasingOneSchedulePayment,

    newLeasing,
    addLeasingLoading,
    addLeasingRequest,
    addLeasingError,

    changeStatusLeasing,
    changeStatusLeasingLoading,
    changeStatusLeasingRequest,
    changeStatusLeasingError,

    leasingForm,
    clearForm,

    //schedulePayment

    newLeasingSchedule,
    addLeasingScheduleLoading,
    addLeasingScheduleRequest,
    addLeasingScheduleError,

    updateLeasingSchedule,
    updateLeasingScheduleLoading,
    updateLeasingScheduleRequest,
    updateLeasingScheduleError,

    deleteLeasingSchedule,
    deleteLeasingScheduleLoading,
    deleteLeasingScheduleRequest,
    deleteLeasingScheduleError,

    leasingSchedulePaymentForm,
    clearFormLeasingSchedulePayment,

    //actualPayment

    leasingActualPaymentsResponse,
    leasingActualPaymentsLoading,
    fetchLeasingActualPayments,

    newLeasingActual,
    addLeasingActualLoading,
    addLeasingActualRequest,
    addLeasingActualError,

    leasingActualPaymentForm,
    clearFormLeasingActualPayment,

    getLeasingStatus,
    getLeasingStatusColor,
    getLeasingScheduleStatusColor,
    getLeasingScheduleStatus,

    //Download

    leasingFileList,
    uploadLeasingContractList,
    handleRemoveLeasingFile,

    //widget

    vehicleLeasingsWidgetResponse,
    vehicleLeasingsWidgetLoading,
    fetchLeasingsWidget,
  };
};

export const useVehicleEquipment = () => {
  const {
    response: fetchVehicleEquipmentsResponse,
    loading: fetchVehicleEquipmentsLoading,
    request: fetchVehicleEquipmentsRequest,
  } = useApi<IVehicleEquipment[], { vehicle_id: number }>({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/equipment`,
    method: "GET",
  });
  const {
    response: fetchVehicleEquipmentsHistoryResponse,
    loading: fetchVehicleEquipmentsHistoryLoading,
    request: fetchVehicleEquipmentsHistoryRequest,
  } = useApi<
    IVehicleEquipment[],
    { vehicle_id: number; include_deleted: boolean }
  >({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/equipment`,
    method: "GET",
  });
  const {
    response: vehicleEquipmentsCreateResponse,
    loading: fetchVehicleEquipmentsCreateLoading,
    request: fetchVehicleEquipmentsCreateRequest,
    error: vehicleEquipmentCreateError,
  } = useApi<IVehicleEquipment[], { vehicle_id: number }>({
    dynamicUrl: (p) => `/api/v1/vehicles/${p.vehicle_id}/equipment`,
    method: "POST",
  });
  const {
    response: vehicleEquipmentsEditResponse,
    loading: fetchVehicleEquipmentsEditLoading,
    request: fetchVehicleEquipmentsEditRequest,
    error: vehicleEquipmentsEditError,
  } = useApi<
    IVehicleEquipment[],
    { vehicle_id: number; vehicle_equipment_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/vehicles/${p.vehicle_id}/equipment/${p.vehicle_equipment_id}`,
    method: "PUT",
  });
  const {
    response: vehicleEquipmentsDeleteResponse,
    loading: fetchVehicleEquipmentsDeleteLoading,
    request: fetchVehicleEquipmentsDeleteRequest,
    error: vehicleEquipmentsDeleteError,
  } = useApi<
    IVehicleEquipment[],
    { vehicle_id: number; vehicle_equipment_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/vehicles/${p.vehicle_id}/equipment/${p.vehicle_equipment_id}`,
    method: "DELETE",
  });

  const { validatePromise } = useHelpers();

  const defaultVehicleEquipmentForm: IVehicleEquipmentForm = {
    id: undefined,
    inspection_types: ["weekly", "mobile", "handing", "return"],
    serial: undefined,
    comment: undefined,
    checkbox: true,
    lost_cost: 0,
    template_id: undefined,
    template_lost_cost: undefined,
  };

  const vehicleEquipmentFormRef = ref<FormInstance>();
  const vehicleEquipmentForm = ref({ ...defaultVehicleEquipmentForm });

  const vehicleEquipmentRules = computed<FormRules>(() => {
    return {
      template_id: [
        {
          required: true,
          message: "Выберите предмет",
          trigger: "change",
        },
      ],
    };
  });

  const vehicleEquipmentList = computed(() => {
    return fetchVehicleEquipmentsResponse?.value ?? [];
  });

  const vehicleEquipmentHistoryList = computed(() => {
    return fetchVehicleEquipmentsHistoryResponse?.value ?? [];
  });

  const clearForm = () => {
    vehicleEquipmentForm.value = { ...defaultVehicleEquipmentForm };
  };

  const createVehicleEquipment = async (vehicle_id: number) => {
    await validatePromise(vehicleEquipmentFormRef.value!);
    try {
      await fetchVehicleEquipmentsCreateRequest({
        vehicle_id,
        ...vehicleEquipmentForm.value,
      });
      fetchVehicleEquipmentsRequest({
        vehicle_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: vehicleEquipmentCreateError.value?.title ?? "Ошибка",
        message:
          vehicleEquipmentCreateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const updateVehicleEquipment = async (
    vehicle_id: number,
    vehicle_equipment_id: number,
    form: IVehicleEquipmentForm,
    table: boolean,
  ) => {
    if (!table) {
      await validatePromise(vehicleEquipmentFormRef.value!);
    }

    try {
      await fetchVehicleEquipmentsEditRequest({
        vehicle_id,
        vehicle_equipment_id,
        ...form,
      });
      fetchVehicleEquipmentsRequest({
        vehicle_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно обновлены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: vehicleEquipmentsEditError.value?.title ?? "Ошибка",
        message:
          vehicleEquipmentsEditError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const deleteVehicleEquipment = async (
    vehicle_id: number,
    vehicle_equipment_id: number,
  ) => {
    try {
      await fetchVehicleEquipmentsDeleteRequest({
        vehicle_id,
        vehicle_equipment_id,
      });
      fetchVehicleEquipmentsRequest({
        vehicle_id,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно удалены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: vehicleEquipmentsDeleteError.value?.title ?? "Ошибка",
        message:
          vehicleEquipmentsDeleteError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  return {
    fetchVehicleEquipmentsRequest,
    fetchVehicleEquipmentsHistoryRequest,
    createVehicleEquipment,
    updateVehicleEquipment,
    deleteVehicleEquipment,

    vehicleEquipmentList,
    vehicleEquipmentHistoryList,
    fetchVehicleEquipmentsLoading,

    vehicleEquipmentForm,
    vehicleEquipmentFormRef,
    vehicleEquipmentRules,

    clearForm,
  };
};

export const useVehicleExtraEquipment = () => {
  const {
    response: vehicleExtraEquipments,
    loading: fetchVehicleExtraEquipmentsLoading,
    request: fetchVehicleExtraEquipments,
  } = useApi<IVehicleExtraEquipmnet[], IVehicleExtraEquipmnetParams>({
    dynamicUrl: (p) =>
      `/api/v1/vehicles/${p.company_id}/${p.vehicle_id}/extra-equipment`,
    method: "GET",
  });

  return {
    vehicleExtraEquipments,
    fetchVehicleExtraEquipmentsLoading,
    fetchVehicleExtraEquipments,
  };
};

export const useVehiclesRent = () => {
  const {
    detailResult,
    vehicleCreateForm,
    vehicleCreateFormSTSPart,
    vehicleCreateFormRegistrationCertificatePart,
    vehiclesRentTemplateForm,
    vehiclesRentTemplateFormRef,
    vehiclesRentRedemptionForm,
    vehiclesRentRedemptionFormRef,
    vehicleCreateFormLicence,
    vehicleCreateFormOther,
    vehicleCreateFormDealPart,
  } = storeToRefs(useVehiclesStore());
  const { updateVehicleRequest } = useVehiclesStore();
  const { validatePromise } = useHelpers();

  const {
    response: rentTemplatesResponse,
    loading: fetchRentTemplatesListLoading,
    error: fetchRentTemplatesError,
    request: fetchRentTemplates,
  } = useApi<IVehicleRentTemplatesResponse, IVehicleRentParams>({
    url: "/api/v1/rent_template",
    method: "GET",
  });

  const {
    response: fetchRentTemplateDetailResponse,
    loading: fetchRentTemplateDetailLoading,
    error: fetchRentTemplateDetailError,
    request: fetchRentTemplateDetail,
  } = useApi<IVehicleRentTemplate, IVehicleRentTemplateDetailParams>({
    dynamicUrl: (p) => `/api/v1/rent_template/${p.template_id}`,
    method: "GET",
  });

  const {
    loading: createRentTemplateLoading,
    error: createRentTemplateError,
    response: createRentTemplateResponse,
    request: createRentTemplateRequest,
  } = useApi<
    IVehicleRentTemplateCreateResponse,
    IVehicleRentTemplateCreateParams
  >({
    url: "/api/v1/rent_template",
    method: "POST",
  });

  const {
    loading: updateRentTemplateLoading,
    error: updateRentTemplateError,
    response: updateRentTemplateResponse,
    request: updateRentTemplateRequest,
  } = useApi<IVehicleRentTemplate, IVehicleRentTemplateUpdateParams>({
    dynamicUrl: (p) => `/api/v1/rent_template/${p.template_id}`,
    method: "PATCH",
  });

  const {
    loading: predictChargeDateLoading,
    error: predictChargeDateError,
    response: predictChargeDate,
    request: predictChargeDateRequest,
  } = useApi<string[], IVehicleRentTemplatePredictChargeDate>({
    url: "/api/v1/rent_template/predict_charge_date",
    method: "POST",
  });

  const { userProfile } = storeToRefs(useUserStore());
  const { hideDrawer } = useAppStore();
  const initialPageFilters = {
    is_active: true,
    search: "",
    page: 1,
    limit: 20,
  };
  const pageFilters = ref({
    ...initialPageFilters,
  });

  const rentTemplates = computed(() => {
    return rentTemplatesResponse.value?.items ?? [];
  });
  const rentTemplatesTotalItems = computed(() => {
    return rentTemplatesResponse.value?.total_items ?? 0;
  });

  watch(fetchRentTemplateDetailResponse, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof IVehicleRentTemplate)[];
      keys.forEach((key) => {
        if (key in vehiclesRentTemplateForm.value) {
          // @ts-ignore
          vehiclesRentTemplateForm.value[key] = v[key];
        }
      });
    }
  });

  const createReferenceBookRentTemplate = async () => {
    await validatePromise(vehiclesRentTemplateFormRef.value!);
    try {
      await createRentTemplateRequest({
        ...vehiclesRentTemplateForm.value,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
      fetchRentTemplates({ ...pageFilters.value });
      hideDrawer();
    } catch (e) {
      ElNotification({
        title: createRentTemplateError.value?.title ?? "Ошибка",
        message:
          createRentTemplateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };
  const updateReferenceBookRentTemplate = async () => {
    await validatePromise(vehiclesRentTemplateFormRef.value!);
    try {
      const data = {
        ...vehiclesRentTemplateForm.value,
        template_id: fetchRentTemplateDetailResponse.value?.id!,
      };
      if (
        vehiclesRentTemplateForm.value.accrual_type == "WEEKLY" ||
        vehiclesRentTemplateForm.value.accrual_type == "MONTHLY"
      ) {
        await updateRentTemplateRequest({
          ...data,
          days_off: undefined,
          first_day_off_in: undefined,
        });
      } else {
        await updateRentTemplateRequest(data);
      }
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно изменены",
        type: "success",
      });
      fetchRentTemplates({ ...pageFilters.value });
      hideDrawer();
    } catch (e) {
      ElNotification({
        title: createRentTemplateError.value?.title ?? "Ошибка",
        message:
          createRentTemplateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const getTemplateName = () => {
    const baseName = getVehicleFullname(
      detailResult.value?.brand?.brand!,
      detailResult.value?.car_model?.car_model!,
      detailResult.value?.plate_number,
    );
    let newName = baseName;
    let suffix = 1;
    const existingNames =
      rentTemplates.value?.map((template) => template.name) || [];

    while (existingNames.includes(newName)) {
      newName = `${baseName} (${suffix})`;
      suffix++;
    }

    return newName;
  };

  const createRentTemplate = async () => {
    await validatePromise(vehiclesRentTemplateFormRef.value!);
    try {
      const baseName = getVehicleFullname(
        detailResult.value?.brand?.brand!,
        detailResult.value?.car_model?.car_model!,
        detailResult.value?.plate_number,
      );
      let newName = baseName;
      let suffix = 1;
      const existingNames =
        rentTemplates.value?.map((template) => template.name) || [];

      while (existingNames.includes(newName)) {
        newName = `${baseName} (${suffix})`;
        suffix++;
      }

      vehiclesRentTemplateForm.value.name = vehiclesRentTemplateForm.value.id
        ? vehiclesRentTemplateForm.value.name
        : newName;
      vehiclesRentTemplateForm.value.name = getTemplateName();
      vehiclesRentTemplateForm.value.franchise_cost =
        vehiclesRentTemplateForm.value.franchise_cost ?? 0;
      vehiclesRentTemplateForm.value.deposit_cost =
        vehiclesRentTemplateForm.value.deposit_cost ?? 0;

      await createRentTemplateRequest(vehiclesRentTemplateForm.value);
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
      fetchRentTemplates();
    } catch (e) {
      ElNotification({
        title: createRentTemplateError.value?.title ?? "Ошибка",
        message:
          createRentTemplateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };
  const updateRentTemplate = async () => {
    await validatePromise(vehiclesRentTemplateFormRef.value!);
    try {
      await updateRentTemplateRequest({
        ...vehiclesRentTemplateForm.value,
        rent_cost: undefined,
        template_id: detailResult.value?.rent_template_id!,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: updateRentTemplateError.value?.title ?? "Ошибка",
        message:
          updateRentTemplateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };
  const getRentTemplates = async () => {
    try {
      await fetchRentTemplates({ is_active: true });
    } catch (error) {
      console.log(error);
    }
  };
  const updateVehicleRentData = async () => {
    console.log({ vehicleCreateForm: vehicleCreateForm.value });
    try {
      console.log(
        "vehiclesRentRedemptionForm.value.rent_amount",
        vehiclesRentRedemptionForm.value.rent_amount,
      );
      await updateVehicleRequest({
        ...vehicleCreateForm.value,
        ...vehicleCreateFormSTSPart.value,
        ...vehicleCreateFormRegistrationCertificatePart.value,
        ...vehicleCreateFormDealPart.value,
        ...vehicleCreateFormLicence.value,
        ...vehicleCreateFormOther.value,
        ...vehiclesRentRedemptionForm.value,
        rent_template_id:
          (createRentTemplateResponse.value?.id ??
            detailResult.value?.rent_template_id) ||
          null,
        redemption_expiration: vehiclesRentRedemptionForm.value
          .redemption_expiration
          ? formatDateToServer(
              vehiclesRentRedemptionForm.value.redemption_expiration,
            )
          : undefined,
        rent_amount: vehiclesRentRedemptionForm.value.rent_amount || null,
        redemption_amount:
          vehiclesRentRedemptionForm.value.redemption_amount || null,
        redemption_franchise_cost:
          vehiclesRentRedemptionForm.value.redemption_franchise_cost || 0,
        redemption_deposit_cost:
          vehiclesRentRedemptionForm.value.redemption_deposit_cost || 0,
        engine_power:
          vehicleCreateFormSTSPart.value.engine_power &&
          Number(vehicleCreateFormSTSPart.value.engine_power) > 0
            ? vehicleCreateFormSTSPart.value.engine_power
            : undefined,
        licence_issued_date:
          vehicleCreateFormLicence.value.licence_issued_date &&
          vehicleCreateFormLicence.value.licence_issued_date != ""
            ? vehicleCreateFormLicence.value.licence_issued_date
            : null,
        licence_expires_at:
          vehicleCreateFormLicence.value.licence_expires_at &&
          vehicleCreateFormLicence.value.licence_expires_at != ""
            ? vehicleCreateFormLicence.value.licence_expires_at
            : null,
        licence_series:
          vehicleCreateFormLicence.value.licence_series &&
          vehicleCreateFormLicence.value.licence_series != ""
            ? vehicleCreateFormLicence.value.licence_series
            : null,
        start_cost: vehicleCreateFormOther.value.start_cost
          ? vehicleCreateFormOther.value.start_cost
          : 0,
        mod_spec_country: userProfile.value?.country ?? "RU",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const updateVehicleRentPart = async () => {
    console.log("updateVehicleRentPart");
    console.log("vehiclesRentRedemptionForm", vehiclesRentRedemptionForm.value);

    try {
      if (vehiclesRentRedemptionForm.value.periodic_debit_type === "RENT") {
        if (detailResult.value?.rent_template_id) {
          await updateVehicleRentData();
        } else {
          await createRentTemplate();
          await updateVehicleRentData();
        }
        ElNotification({
          title: "Успешный запрос",
          message: "Данные успешно обновлены",
          type: "success",
        });
        return true;
      } else if (
        vehiclesRentRedemptionForm.value.periodic_debit_type === "REDEMPTION"
      ) {
        await validatePromise(vehiclesRentRedemptionFormRef.value!);
        await updateVehicleRentData();
        ElNotification({
          title: "Успешный запрос",
          message: "Данные успешно обновлены",
          type: "success",
        });
        return true;
      }
    } catch (error) {
      console.log(error);
      ElNotification({
        title: "Ошибка",
        message: "Не удалось обновить данные",
        type: "error",
      });
      return false;
    }

    return false;
  };

  const fetchPredictChargeDate = async () => {
    await validatePromise(vehiclesRentTemplateFormRef.value!);
    try {
      await predictChargeDateRequest({
        name: getTemplateName(),
        days_off: vehiclesRentTemplateForm.value.days_off,
        first_day_off_in: vehiclesRentTemplateForm.value.first_day_off_in,
        accrual_type: vehiclesRentTemplateForm.value.accrual_type,
        rent_cost: vehiclesRentTemplateForm.value.rent_cost,
        franchise_cost: vehiclesRentTemplateForm.value.franchise_cost ?? 0,
        deposit_cost: vehiclesRentTemplateForm.value.deposit_cost ?? 0,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: updateRentTemplateError.value?.title ?? "Ошибка",
        message:
          updateRentTemplateError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  const clearFilters = () => {
    pageFilters.value = {
      ...initialPageFilters,
    };
  };

  const getTemplateAccuralType = (type: TAccrualType) => {
    switch (type) {
      case "DAILY":
        return "Ежедневный";
      case "WEEKLY":
        return "Eженедельный";
      case "MONTHLY":
        return "Ежемесячный";
      default:
        return "";
    }
  };

  return {
    rentTemplatesResponse,
    rentTemplates,
    rentTemplatesTotalItems,
    fetchRentTemplatesListLoading,
    fetchRentTemplates, // TODO backend filters query, sort desk

    clearFilters,
    pageFilters,

    getRentTemplates,

    createRentTemplateLoading,
    createRentTemplateResponse,
    createRentTemplate,
    createReferenceBookRentTemplate,

    updateRentTemplateLoading,
    updateRentTemplateResponse,
    updateReferenceBookRentTemplate,
    updateVehicleRentData,
    updateVehicleRentPart,

    fetchRentTemplateDetail,
    fetchRentTemplateDetailLoading,
    fetchRentTemplateDetailResponse,

    predictChargeDateLoading,
    predictChargeDateError,
    predictChargeDate,
    fetchPredictChargeDate,

    getTemplateAccuralType,
  };
};

interface IVehicleDowntimeReasonByVehicleCreateForm
  extends IVehicleDowntimeReasonCreateForm {
  vehicle_id: number;
}

export const useVehicleDowntime = () => {
  const {
    response: downtimeReasons,
    loading: fetchVehicleDowntimeReasonsLoading,
    request: fetchVehicleDowntimeReasons,
  } = useApi<IVehicleDowntimeReason[]>({
    url: `/api/v1/vehicle_downtime/reasons?company_group_id=1`,
    method: "GET",
  });
  const {
    response: parkingPlaces,
    loading: fetchParkingPlacesLoading,
    request: fetchParkingPlaces,
  } = useApi<IVehicleParkingPlace[]>({
    url: `/api/v1/parking_places`,
    method: "GET",
  });
  const { request: createParkingPlaces } = useApi<
    IVehicleParkingPlace,
    IVehicleParkingPlaceCreateForm
  >({
    url: `/api/v1/parking_places`,
    method: "POST",
  });
  const {
    response: createVehicleDowntimeReasonsResponse,
    loading: createVehicleDowntimeReasonsLoading,
    error: createVehicleDowntimeReasonsErr,
    request: createVehicleDowntimeReasons,
  } = useApi<
    IVehicleDowntimeReason[],
    {
      name: string;
    }
  >({
    url: `/api/v1/vehicle_downtime/reasons`,
    method: "POST",
  });
  const {
    response: deleteVehicleDowntimeReasonsResponse,
    loading: deleteVehicleDowntimeReasonsLoading,
    error: deleteVehicleDowntimeReasonsErr,
    request: deleteVehicleDowntimeReasons,
  } = useApi<
    IVehicleDowntimeReason,
    {
      name: string;
      id: number;
    }
  >({
    dynamicUrl: (p) => `/api/v1/vehicle_downtime/reasons/${p.id}`,
    method: "DELETE",
  });

  const {
    response: createVehicleDowntimeReasonsByVehicleResponse,
    error: createVehicleDowntimeReasonsByVehicleError,
    loading: createVehicleDowntimeReasonsByVehicleLoading,
    request: createVehicleDowntimeReasonsByVehicle,
  } = useApi<
    IVehicleDowntimeReason[],
    IVehicleDowntimeReasonByVehicleCreateForm
  >({
    dynamicUrl: (p) => `/api/v1/vehicle_downtime/${p.vehicle_id}`,
    method: "POST",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const emptyDowntimeReasonForm = {
    name: "",
  };
  const downtimeReasonRef = ref<FormInstance>();
  const downtimeReasonRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование простоя",
        trigger: "blur",
      },
    ],
  });
  const downtimeReasonForm = ref({
    ...emptyDowntimeReasonForm,
  });

  const createDowntimeReason = async (): Promise<void> => {
    validatePromise(downtimeReasonRef.value!).then(async () => {
      try {
        await createVehicleDowntimeReasons({
          ...downtimeReasonForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Вид простоя создан",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createVehicleDowntimeReasonsErr.value?.title ?? "Ошибка",
          message:
            createVehicleDowntimeReasonsErr.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteDowntimeReason = async (id: number): Promise<void> => {
    try {
      await deleteVehicleDowntimeReasons({
        id,
        ...downtimeReasonForm.value,
      });
      await fetchVehicleDowntimeReasons();
      ElNotification({
        title: "Успешный запрос",
        message: "Вид простоя удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteVehicleDowntimeReasonsErr.value?.title ?? "Ошибка",
        message:
          deleteVehicleDowntimeReasonsErr.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const clear = () => {
    downtimeReasonForm.value = { ...emptyDowntimeReasonForm };
  };

  return {
    downtimeReasonRef,
    downtimeReasonRules,
    downtimeReasonForm,
    clear,

    downtimeReasons,
    fetchVehicleDowntimeReasonsLoading,
    fetchVehicleDowntimeReasons,

    parkingPlaces,
    fetchParkingPlaces,

    createVehicleDowntimeReasonsResponse,
    createVehicleDowntimeReasonsLoading,
    createVehicleDowntimeReasons,
    createDowntimeReason,

    deleteDowntimeReason,
    deleteVehicleDowntimeReasonsLoading,

    createVehicleDowntimeReasonsByVehicleError,
    createVehicleDowntimeReasonsByVehicle,
  };
};

export const useVehicleGroups = () => {
  const {
    response: vehicleGroups,
    loading: fetchVehicleGroupsLoading,
    request: fetchVehicleGroups,
  } = useApi<IVehicleGroup[]>({
    dynamicUrl: (p) => `/api/v1/company_units/${p.company_id}`,
    method: "GET",
  });
  const {
    response: createVehicleGroupsResponse,
    loading: createVehicleGroupsLoading,
    error: createVehicleGroupsErr,
    request: createVehicleGroups,
  } = useApi<
    IVehicleGroup,
    {
      company_id: number;
    }
  >({
    dynamicUrl: (p) => `/api/v1/company_units/${p.company_id}`,
    method: "POST",
  });
  const {
    response: deleteVehicleGroupsResponse,
    loading: deleteVehicleGroupsLoading,
    error: deleteVehicleGroupsErr,
    request: deleteVehicleGroups,
  } = useApi<
    IVehicleGroup,
    {
      name: string;
      company_id: number;
      unit_id: number;
    }
  >({
    dynamicUrl: (p) => `/api/v1/company_units/${p.company_id}/${p.unit_id}`,
    method: "DELETE",
  });
  const {
    response: editVehicleGroupsResponse,
    loading: editVehicleGroupsLoading,
    error: editVehicleGroupsErr,
    request: editVehicleGroups,
  } = useApi<
    IVehicleGroup,
    {
      name: string;
      company_id: number;
      unit_id: number;
    }
  >({
    dynamicUrl: (p) => `/api/v1/company_units/${p.company_id}/${p.unit_id}`,
    method: "PATCH",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const emptyVehicleGroupForm = {
    name: "",
  };
  const vehicleGroupRef = ref<FormInstance>();
  const vehicleGroupRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование группы",
        trigger: "blur",
      },
    ],
  });
  const vehicleGroupForm = ref({
    ...emptyVehicleGroupForm,
  });

  const createVehicleGroup = async (company_id: number): Promise<void> => {
    validatePromise(vehicleGroupRef.value!).then(async () => {
      try {
        await createVehicleGroups({
          company_id,
          ...vehicleGroupForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Группа создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createVehicleGroupsErr.value?.title ?? "Ошибка",
          message:
            createVehicleGroupsErr.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const deleteVehicleGroup = async (
    company_id: number,
    unit_id: number,
  ): Promise<void> => {
    try {
      await deleteVehicleGroups({
        company_id,
        unit_id,
        ...vehicleGroupForm.value,
      });
      await fetchVehicleGroups();
      ElNotification({
        title: "Успешный запрос",
        message: "Группа удалена",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteVehicleGroupsErr.value?.title ?? "Ошибка",
        message:
          deleteVehicleGroupsErr.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };
  const editVehicleGroup = async (
    company_id: number,
    unit_id: number,
  ): Promise<void> => {
    validatePromise(vehicleGroupRef.value!).then(async () => {
      try {
        await editVehicleGroups({
          company_id,
          unit_id,
          ...vehicleGroupForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Группа изменена",
          type: "success",
        });
      } catch (e) {
        console.error({ e });
        ElNotification({
          title: editVehicleGroupsErr.value?.title ?? "Ошибка",
          message:
            editVehicleGroupsErr.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    vehicleGroupForm.value = { ...emptyVehicleGroupForm };
  };
  const getVehicleGroupById = (id: string | number) => {
    return vehicleGroups.value?.find((r) => r.id === Number(id));
  };

  return {
    vehicleGroupRef,
    vehicleGroupRules,
    vehicleGroupForm,
    getVehicleGroupById,
    clear,

    vehicleGroups,
    fetchVehicleGroupsLoading,
    fetchVehicleGroups,

    createVehicleGroupsResponse,
    createVehicleGroupsLoading,
    createVehicleGroup,
    createVehicleGroups,

    deleteVehicleGroup,
    deleteVehicleGroupsLoading,

    editVehicleGroupsResponse,
    editVehicleGroupsLoading,
    editVehicleGroup,
    editVehicleGroups,
  };
};

export const useVehicleGeoposition = () => {
  const {
    response: vehicleGeoposition,
    loading: vehicleGeopositionLoading,
    error: vehicleGeopositionErr,
    request: fetchVehicleGeoposition,
  } = useApi<IVehicleGeoposition[], IVehicleGeopositionParams>({
    url: `/api/v1/vehicles/geoposition`,
    method: "GET",
  });

  const getVehicleGeoposition = async (vehicleId: number) => {
    try {
      const result = await fetchVehicleGeoposition({
        vehicle_id: vehicleId,
      });
      if (result.length)
        window.open(
          `https://maps.yandex.ru/?ll=${result[0].longitude},${result[0].latitude}&text=${result[0].latitude}+${result[0].longitude}&z=17`,
        );
    } catch (e: any) {
      ElNotification({
        title: "Ошибка",
        message:
          e?.data?.user_message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  return {
    vehicleGeoposition,
    vehicleGeopositionLoading,
    getVehicleGeoposition,
  };
};

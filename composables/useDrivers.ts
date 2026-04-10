import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import _ from "lodash";
import type { IPagination, TDefaultElPlusTypes } from "@/types/apiDefault";
import * as t from "@/types/drivers";
import type { TFilesType } from "@/types/files";
import {
  ElNotification,
  dayjs,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
  type UploadProps,
  type UploadFiles,
  type UploadFile,
  type FormItemRule,
} from "element-plus";
import { type IUploadedServerFile, useFiles } from "@/composables/useFiles";
import { formatCurrency, formatDay } from "@/helpers/format.helpers";

import { useUserStore } from "@/stores/userStore";
import { useAppStore } from "@/stores/appStore";
import { useDriversStore } from "@/stores/driversStore";
import { useDraftsStore } from "@/stores/draftsStore";
import useApi from "@/composables/useApi";
import { AUTH_ENDPOINT } from "@/api";

import { EDrawerRouteHash } from "./useApp";
import { useHelpers } from "./useHelpers";
import { getUserFullname } from "@/helpers/fullname.helpers";
import type { TBalanceOperationsCategory } from "@/types/balanceOperations";
import type { MaybeRef } from "@vueuse/core";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";
import { useIntegrationsImportStore } from "@/stores/integrationsStore";
import type {
  IDebitFundsSettings,
  IDebitFundsSettingsCreateForm,
  IDebitFundsSettingsDelete,
  IDebitFundsSettingsUpdateForm,
} from "@/types/settings";

export enum EDriverTabKey {
  passport = "passport",
  licence = "licence",
  contacts = "contacts",
  other = "other",
  files = "files",
}

export const useDrivers = () => {
  const {
    loading: fetchDriversLoading,
    response: driversResponse,
    request: fetchDrivers,
  } = useApi<IPagination<t.IDriver>, t.IDriversListParams>({
    url: "/api/v1/drivers",
    method: "GET",
  });
  const {
    loading: detailLoading,
    response: detailResult,
    request: fetchDetail,
  } = useApi<t.IDriverDetail, t.IDriversDetailParams>({
    dynamicUrl: (p) => `/api/v1/drivers/${p.driver_id}`,
    method: "GET",
  });
  const {
    loading: createDriverLoading,
    error: createDriverError,
    response: newDriver,
    request: createDriverRequest,
  } = useApi<t.IDriver, t.IDriverCreateForm>({
    url: "/api/v1/drivers",
    method: "POST",
  });
  const {
    response: updateDriverResponse,
    loading: updateDriverLoading,
    request: updateDriverRequest,
    error: updateDriverError,
  } = useApi<t.IDriver, t.IDriver>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/drivers/${p.id}`,
  });
  const {
    response: updateDriverLicenceResponse,
    loading: updateDriverLicenceLoading,
    request: updateDriverLicenceRequest,
    error: updateDriverLicenceError,
  } = useApi<t.IDriverLicence, t.IDriverLicenceUpdateParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/drivers/${p.driver_id}/licence`,
  });
  const {
    response: updateDriverStatusResponse,
    loading: updateDriverStatusLoading,
    request: updateDriverStatusRequest,
    error: updateDriverStatusError,
  } = useApi<t.IDriverStatus, t.IDriverStatusParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/drivers/${p.driver_id}/status`,
  });
  const {
    loading: driverStatusesDetailLoading,
    response: driverStatusesDetailResult,
    request: fetchDriverStatusesDetail,
  } = useApi<
    IPagination<t.IDriverStatusesDetails>,
    t.IDriverStatusesDetailParams
  >({
    dynamicUrl: (p) => `/api/v1/drivers/${p.driver_id}/statuses`,
    method: "GET",
  });

  const route = useRoute();
  const appStore = useAppStore();
  const { validatePromise } = useHelpers();
  const { hideDrawer } = appStore;
  const { selectedDraftDriver, newDraft } = storeToRefs(useDraftsStore());
  const { userProfileLocation, userProfileLocalINNString, userProfile } =
    storeToRefs(useUserStore());

  const { uploadFileList, downloadFile } = useFiles();
  const driverPhotoFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const passportFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const registrationFileList = ref<IUploadedServerFile[] | UploadUserFile[]>(
    []
  );
  const medicalCertificateFileList = ref<
    IUploadedServerFile[] | UploadUserFile[]
  >([]);
  const criminalRecordFileList = ref<IUploadedServerFile[] | UploadUserFile[]>(
    []
  );
  const licenseFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const additionalFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);
  const uploadDriverPhotoFileList = (
    _: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    uploadFileList(uploadFiles, "DRIVER_PHOTO").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        driverPhotoFileList.value = [...r].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined
        );
      }
    });
  };
  const uploadPassportFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "DRIVER_PASSPORT").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        passportFileList.value = [...r, ...passportFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined
        );
      }
    });
  };
  const uploadRegistrationFileList = (
    _: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    uploadFileList(uploadFiles, "DRIVER_TEMPORARY_REGISTRATION").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        registrationFileList.value = [
          ...r,
          ...registrationFileList.value,
        ].filter((f) => (f as IUploadedServerFile)?.id !== undefined);
      }
    });
  };
  const uploadMedicalCertificateFileList = (
    _: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    uploadFileList(uploadFiles, "DRIVER_MEDICAL_CERTIFICATE").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        medicalCertificateFileList.value = [
          ...r,
          ...medicalCertificateFileList.value,
        ].filter((f) => (f as IUploadedServerFile)?.id !== undefined);
      }
    });
  };
  const uploadCriminalRecordFileList = (
    _: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    uploadFileList(uploadFiles, "DRIVER_CRIMINAL_RECORD").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        criminalRecordFileList.value = [
          ...r,
          ...criminalRecordFileList.value,
        ].filter((f) => (f as IUploadedServerFile)?.id !== undefined);
      }
    });
  };

  const uploadAdditionalFileList = (
    _: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    uploadFileList(uploadFiles, "DRIVER_ADDITIONAL_FILES").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        additionalFileList.value = [...r, ...additionalFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined
        );
      }
    });
  };
  const uploadLicenseFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "DRIVER_LICENSE").then((r) => {
      if (r?.length) {
        allDocuments.value = [...allDocuments.value, ...r.map((f) => f.id)];
        console.log([...r, ...licenseFileList.value]);
        licenseFileList.value = [...r, ...licenseFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined
        );
      }
    });
  };
  const clearDriverFilesLists = () => {
    driverPhotoFileList.value = [];
    passportFileList.value = [];
    registrationFileList.value = [];
    medicalCertificateFileList.value = [];
    criminalRecordFileList.value = [];
    licenseFileList.value = [];
    additionalFileList.value = [];
  };
  const handleRemoveFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id) allDocuments.value = allDocuments.value.filter((f) => f !== id);
  };

  const validateError = ref(false);
  const validateForm = (silence: boolean = false) =>
    new Promise((res, rej) => {
      Promise.all([
        validatePromise(
          passportFormPartRef.value!,
          silence,
          EDriverTabKey.passport
        ),
        validatePromise(
          licenceFormPartRef.value!,
          silence,
          EDriverTabKey.licence
        ),
        validatePromise(
          otherDataFormPartRef.value!,
          silence,
          EDriverTabKey.other
        ),
        validatePromise(
          contactsDataFormPartRef.value!,
          silence,
          EDriverTabKey.contacts
        ),
      ])
        .then((v) => {
          validateError.value = false;
          res(v);
        })
        .catch((e) => {
          console.error({ e });
          validateError.value = true;
          rej(e);
        });
    });

  const serializeDriverDataToServer = () => {
    if (licenceFormPart.value.driverCategory == "B") {
      licenceFormPart.value.categories = ["B"];
      licenceFormPart.value.driver_licence_extra_at = false;
    } else if (licenceFormPart.value.driverCategory == "B/AT") {
      licenceFormPart.value.categories = ["B"];
      licenceFormPart.value.driver_licence_extra_at = true;
    } else if (licenceFormPart.value.driverCategory == "") {
      licenceFormPart.value.categories = [];
      licenceFormPart.value.driver_licence_extra_at = false;
    }
    return {
      ...passportFormPart.value,
      ...licenceFormPart.value,
      ...otherDataFormPart.value,
      ...contactsDataFormPart.value,
      passport_registration_type:
        passportFormPart.value.passport_country_code == "RU"
          ? "permanent"
          : passportFormPart.value.passport_registration_type,
      passport_temporary_registration_date:
        passportFormPart.value.passport_country_code == "RU"
          ? "2050-01-01"
          : passportFormPart.value.passport_temporary_registration_date,
      licence: licenceFormPart.value,
      phone: (contactsDataFormPart.value.phone ?? "")
        .replaceAll("-", "")
        .replaceAll(" ", "")
        .replaceAll("+", "")
        .replaceAll("(", "")
        .replaceAll(")", ""),
      email: contactsDataFormPart.value.email || null,
      driver_status: t.EDriverStatus.applicant,
      driving_experience_from: licenceFormPart.value.experienceYears
        ? dayjs()
            .subtract(licenceFormPart.value.experienceYears!, "year")
            .format("YYYY-MM-DD")
        : null,
      driver_status_reason: driverStatus.value.status_reason || null,
      driver_status_comment: driverStatus.value?.status_comment || "",
      document_ids: allDocuments.value,
      firstname: passportFormPart.value.passport_first_name,
      lastname: passportFormPart.value.passport_last_name,
      middlename: passportFormPart.value.passport_middle_name,
      id: detailResult.value?.id,
      mod_spec_country: userProfile.value?.country ?? "RU",
      max_franchise: settlementsFormPart.value.max_franchise,
      max_deposit: settlementsFormPart.value.max_deposit,
      accrual_processing_time_local:
        settlementsFormPart.value.accrual_processing_time_local,
      fines_enable_accruals: accrualsFormPart.value.fines_enable_accruals,
      toll_roads_enable_accruals:
        accrualsFormPart.value.toll_roads_enable_accruals,
      damage_cost_by_damage_price:
        autoDamageFormPart.value.damage_cost_by_damage_price,
    };
  };

  const createDriver = (): Promise<void> => {
    return validateForm().then(async (forms) => {
      try {
        await createDriverRequest({
          ...serializeDriverDataToServer(),
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Водитель успешно добавлен",
          type: "success",
        });
      } catch (e) {
        console.error({ e });
        ElNotification({
          title: createDriverError.value?.title ?? "Ошибка",
          message:
            createDriverError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
        throw e;
      }
    });
  };

  const updateDriver = (
    { withoutValidate }: { withoutValidate: boolean } = {
      withoutValidate: false,
    }
  ): Promise<void> => {
    return (withoutValidate ? Promise.resolve() : validateForm()).then(
      async (forms) => {
        try {
          await updateDriverRequest({
            ...serializeDriverDataToServer(),
          });
          // hideDrawer();
          ElNotification({
            title: "Успешный запрос",
            message: "Водитель успешно обновлен",
            type: "success",
          });
        } catch (e) {
          console.error({ e });
          ElNotification({
            title: updateDriverError.value?.title ?? "Ошибка",
            message:
              updateDriverError.value?.message ??
              "Произошла ошибка, обратитесь к администратору",
            type: "error",
          });
        }
      }
    );
  };

  const updateDriverLicence = (): Promise<void> => {
    return validateForm().then(async (forms) => {
      try {
        if (licenceFormPart.value.driverCategory == "B") {
          licenceFormPart.value.categories = ["B"];
          licenceFormPart.value.extra_at = false;
        } else if (licenceFormPart.value.driverCategory == "B/AT") {
          licenceFormPart.value.categories = ["B"];
          licenceFormPart.value.extra_at = true;
        } else if (licenceFormPart.value.driverCategory == "") {
          licenceFormPart.value.categories = [];
          licenceFormPart.value.extra_at = false;
        }
        await updateDriverLicenceRequest({
          ...licenceFormPart.value,
          driver_id: detailResult.value?.id!,
        });
        // ElNotification({
        //   title: "Успешный запрос",
        //   message: "Данные Водительcких прав успешно обновлены",
        //   type: "success",
        // });
      } catch (e) {
        console.error({ e });
        ElNotification({
          title: updateDriverLicenceError.value?.title ?? "Ошибка",
          message:
            updateDriverLicenceError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const updateDriverStatus = async (): Promise<void> => {
    try {
      await updateDriverStatusRequest({
        ...driverStatus.value,
        driver_id: detailResult.value?.id!,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Статус водителя успешно изменен",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      driverStatus.value = { ...detailResult.value!.status };
      ElNotification({
        title: updateDriverStatusError.value?.title ?? "Ошибка",
        message:
          updateDriverStatusError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const passportFormPartDefault: t.IDriverPassportPart = {
    combinedSeriesAndNumber: "",
    passport_last_name: "",
    passport_first_name: "",
    passport_middle_name: "",
    passport_gender: null,
    passport_date_of_birth: null,
    passport_place_of_birth: "",
    passport_country_code: null,
    passport_series: null,
    passport_number: null,
    passport_registration_address: "",
    passport_registration_type: null,
    passport_temporary_registration_number: "",
    passport_temporary_registration_date: null,
    passport_permanent_registration_address: "",
    passport_actual_residence_address: "",
    passport_registration_address_equal_actual_residence: false,
    passport_issued_by: "",
    passport_issued_date: null,
    passport_issued_department_code: "",
  };
  const passportFormPart = ref<t.IDriverPassportPart>({
    ...passportFormPartDefault,
  });
  const passportFormPartRef = ref<FormInstance>();
  const clearPassportFormPart = () => {
    passportFormPart.value = { ...passportFormPartDefault };
  };

  function getPassportRulesByCountryCode(
    countryCode: string | null,
    formKey: keyof t.IDriverPassportPart
  ): FormItemRule[] {
    countryCode = (countryCode || "").toLowerCase();
    if (formKey === "passport_series") {
      if (countryCode === "kz" || countryCode === "by") {
        return [
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[a-zA-Z0-9]*$/.test(value)) {
                callback(
                  new Error(
                    "Серия паспорта должна состоять только из цифр и букв"
                  )
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
        ];
      } else if (countryCode == "kg") {
        return [
          /* { required: true, message: "Введите серию", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[a-zA-Z0-9]*$/.test(value)) {
                callback(
                  new Error(
                    "Серия паспорта должна состоять только из цифр и букв"
                  )
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
        ];
      } else {
        return [
          /* { required: true, message: "Введите серию", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[0-9]*$/.test(value)) {
                callback(
                  new Error("Серия паспорта должна состоять только из цифр")
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
          {
            max: 4,
            message: "Cерия паспорта должна состоять из 4 цифр",
            trigger: ["blur", "change"],
          },
          {
            min: 4,
            message: "Cерия паспорта должна состоять из 4 цифр",
            trigger: ["blur"],
          },
        ];
      }
    }

    if (formKey === "passport_number") {
      if (countryCode === "by") {
        return [
          /* { required: true, message: "Введите номер", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }

              const passportRegex = /^[a-zA-Zа-яА-ЯёЁ]{2}[0-9]{7}$/;

              if (!passportRegex.test(value)) {
                callback(
                  new Error("Номер должен быть в формате: 2 буквы и 7 цифр")
                );
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"],
          },
        ];
      }
      if (countryCode === "tj") {
        return [
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() === "") {
                callback();
                return;
              }

              if (!/^[0-9]*$/.test(value)) {
                callback(
                  new Error("Номер паспорта должен состоять только из цифр")
                );
                return;
              }

              if (value.length !== 9) {
                callback(new Error("Номер паспорта должен состоять из 9 цифр"));
                return;
              }

              callback();
            },
            trigger: ["blur", "change"],
          },
        ];
      }
      if (countryCode === "kz") {
        return [
          /* { required: true, message: "Введите номер", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[a-zA-Z0-9]*$/.test(value)) {
                callback(
                  new Error(
                    "Номер паспорта должен состоять только из цифр и букв"
                  )
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
              console.log({ letterCount });
              if (letterCount > 1) {
                callback(
                  new Error("Номер паспорта может содержать только одну букву")
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
        ];
      } else if (countryCode === "kg") {
        return [
          /* { required: true, message: "Введите номер", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[a-zA-Z0-9]*$/.test(value)) {
                callback(
                  new Error(
                    "Номер паспорта должен состоять только из цифр и букв"
                  )
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
        ];
      } else {
        return [
          /* { required: true, message: "Введите номер", trigger: "blur" }, */
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() == "") {
                callback();
                return;
              }
              if (!/^[0-9]*$/.test(value)) {
                callback(
                  new Error("Номер паспорта должен состоять только из цифр")
                );
              } else {
                callback();
              }
            },
            trigger: ["change"],
          },
          {
            max: 6,
            message: "Номер паспорта должен состоять из 6 цифр",
            trigger: ["blur", "change"],
          },
          {
            min: 6,
            message: "Номер паспорта должен состоять из 6 цифр",
            trigger: ["blur"],
          },
        ];
      }
    }
    if (formKey === "passport_issued_by") {
      if (countryCode !== "kz" && countryCode !== "kg") {
        return [
          /* {
            required: true,
            message: "Введите кем выдан",
            trigger: "blur",
          }, */
        ];
      }
    }
    if (formKey === "passport_expires_at") {
      if (countryCode === "kg") {
        return [
          /* {
            required: true,
            message: "Введите Дата окончания",
            trigger: "blur",
          }, */
        ];
      }
    }
    if (formKey === "passport_personal_number") {
      if (countryCode === "by") {
        return [
          {
            validator: (rule, value, callback) => {
              if (value && value.length && value.length < 5) {
                callback(new Error("Минимум 5 символов"));
              } else {
                callback();
              }
            },
            trigger: ["blur"],
          },
        ];
      }
      if (countryCode === "kg") {
        return [
          /* {
            required: true,
            message: "Введите Персональный номер",
            trigger: "blur",
          }, */
        ];
      }
    }
    return [];
  }
  const passportFormPartRules = computed<FormRules<t.IDriverPassportPart>>(
    () => ({
      passport_last_name: [
        { required: true, message: "Введите фамилию", trigger: "blur" },
      ],
      passport_first_name: [
        { required: true, message: "Введите имя", trigger: "blur" },
      ],
      passport_gender: [
        /* { required: true, message: "Выберите пол", trigger: "change" }, */
      ],
      passport_date_of_birth: [
        /* { required: true, message: "Введите дату рождения", trigger: "blur" }, */
      ],
      passport_place_of_birth: [
        // { required: true, message: "Введите место рождения", trigger: "blur" },
      ],
      passport_country_code: [
        /* { required: true, message: "Выберите гражданство", trigger: "change" }, */
      ],
      passport_series: getPassportRulesByCountryCode(
        passportFormPart.value.passport_country_code,
        "passport_series"
      ),
      passport_number: getPassportRulesByCountryCode(
        passportFormPart.value.passport_country_code,
        "passport_number"
      ),
      passport_issued_by: getPassportRulesByCountryCode(
        passportFormPart.value.passport_country_code,
        "passport_issued_by"
      ),
      passport_expires_at: getPassportRulesByCountryCode(
        passportFormPart.value.passport_country_code,
        "passport_expires_at"
      ),
      passport_personal_number: getPassportRulesByCountryCode(
        passportFormPart.value.passport_country_code,
        "passport_personal_number"
      ),
      passport_issued_department_code: [
        // { required: true, message: "Введите код подразделения", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            if (!value || value.trim() == "") {
              callback();
              return;
            }
            const isValidFormat = /^\d{3}-\d{3}$/.test(value);
            if (!isValidFormat) {
              callback(
                new Error(
                  'Код подразделения должен иметь следующий формат "123-456"'
                )
              );
            } else {
              callback();
            }
          },
          trigger: ["blur"],
        },
        {
          validator: (rule, value, callback) => {
            if (!value || value.trim() == "") {
              callback();
              return;
            }
            if (!/^[0-9-]*$/.test(value)) {
              callback(
                new Error(
                  "Для кода подразделения допустимы только цифры (0-9) и (-)"
                )
              );
            } else {
              callback();
            }
          },
          trigger: ["change", "input"],
        },
        {
          max: 7,
          message:
            'Код подразделения должен состоять из 7 символов в формате "123-456"',
          trigger: ["blur", "change"],
        },
        {
          min: 7,
          message:
            'Код подразделения должен состоять из 7 символов в формате "123-456"',
          trigger: ["blur"],
        },
      ],
      passport_issued_date: [
        /* { required: true, message: "Введите дату выдачи", trigger: "blur" }, */
      ],
      passport_registration_type: [
        /* {
          required: true,
          message: "Выберите тип регистрации",
          trigger: "change",
        }, */
      ],
      // passport_temporary_registration_number: [
      //   { required: true, message: "Введите номер регистрации", trigger: "blur" },
      // ],
      passport_temporary_registration_date: [
        /* {
          required: true,
          message: "Введите дату окончания регистрации",
          trigger: "blur",
        }, */
      ],
    })
  );
  const allDocuments = ref<number[]>([]);
  const clearAllDocuments = () => {
    allDocuments.value = [];
  };

  const contactsDataFormPartDefault: t.IDriverContacts = {
    phone: null,
    passport_permanent_registration_address: "",
    passport_actual_residence_address: "",
    passport_registration_address_equal_actual_residence: false,
  };
  const contactsDataFormPart = ref<t.IDriverContacts>({
    ...contactsDataFormPartDefault,
  });
  const contactsDataFormPartRef = ref<FormInstance>();
  const clearContactsDataFormPart = () => {
    contactsDataFormPart.value = { ...contactsDataFormPartDefault };
  };
  const contactsDataFormPartRules = ref<FormRules>({
    phone: [
      {
        required: true,
        message: "Пожалуйста, введите номер телефона",
        trigger: "change",
      },
    ],
    passport_permanent_registration_address: [
      /* {
        required: true,
        message: "Пожалуйста, введите Адрес постоянной регистрации",
        trigger: "change",
      }, */
    ],
    passport_actual_residence_address: [
      /* {
        required: true,
        message: "Пожалуйста, введите Адрес фактического проживания",
        trigger: "change",
      }, */
    ],
    email: [
      {
        validator: (rule, value, callback) => {
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            callback(new Error("Неверно указана почта"));
          } else {
            callback();
          }
        },
        trigger: "blur",
      },
    ],
  });

  const otherDataFormPartDefault: t.IDriverOther = {
    tax_status: "individual",
    fgis_number: "",
    id_kis_art: "",
    inn: "",
    snils: "",
    comment: "",
    driver_category: "tenant",
    kis_art_issued: null,
    kis_art_expires: null,
  };
  const otherDataFormPart = ref<t.IDriverOther>({
    ...otherDataFormPartDefault,
  });
  const otherDataFormPartRef = ref<FormInstance>();
  const clearOtherDataFormPart = () => {
    otherDataFormPart.value = { ...otherDataFormPartDefault };
  };

  const validateKISField = (
    fieldName: keyof t.IDriverOther,
    message: string
  ) => {
    return (_rule: any, _value: any, callback: any) => {
      const { kis_art_issued, kis_art_expires, id_kis_art } =
        otherDataFormPart.value;

      const isDateFilled = kis_art_issued || kis_art_expires;
      const isIdFilled = id_kis_art?.trim() !== "";

      if (!isDateFilled && !isIdFilled) return callback();

      if (isIdFilled && !isDateFilled) return callback();

      const currentValue = otherDataFormPart.value[fieldName];
      const isEmpty =
        currentValue == null ||
        (typeof currentValue === "string" && currentValue.trim() === "");

      isEmpty ? callback(new Error(message)) : callback();
    };
  };

  const otherDataFormPartRules = ref<FormRules>({
    inn: [
      // {
      //   required: true,
      //   message: "Пожалуйста, введите ИНН/ИИН",
      //   trigger: "change",
      // },
      {
        validator: (rule, value, callback) => {
          if (!value || value.trim() == "") {
            callback();
            return;
          }
          if (!/^[0-9]*$/.test(value)) {
            callback(
              new Error(
                `Для ввода ${userProfileLocalINNString.value} допустимы только цифры`
              )
            );
          } else {
            callback();
          }
        },
        trigger: ["change", "input"],
      },
      {
        validator: (rule, value, callback) => {
          if (!value || value.trim() == "") {
            callback();
            return;
          }
          if (value.length !== 10 && value.length !== 12) {
            callback(
              new Error(
                `${userProfileLocalINNString.value} должен состоять из 10 либо 12 цифр`
              )
            );
          } else {
            callback();
          }
        },
        trigger: ["blur"],
      },
    ],
    snils: [
      {
        validator: (rule, value, callback) => {
          if (!value || value.trim() == "") {
            callback();
            return;
          }
          if (!/^[0-9-\s]*$/.test(value)) {
            callback(
              new Error("Для ввода СНИЛС допустимы только цифры (0-9) и (-)")
            );
          } else {
            callback();
          }
        },
        trigger: ["change", "input"],
      },
      {
        validator: (rule, value, callback) => {
          if (!value || value.trim() == "") {
            callback();
            return;
          }
          const isValidFormat = /^\d{3}-\d{3}-\d{3} \d{2}$/.test(value);
          if (!isValidFormat) {
            callback(
              new Error(
                'СНИЛС должен быть внесен в следующем формате "123-456-789 12'
              )
            );
          } else {
            callback();
          }
        },
        trigger: ["blur", "change"],
      },
    ],
    comment: [
      {
        validator: (rule, value, callback) => {
          if (!value || value.trim() === "") {
            callback();
            return;
          }
          if (value.length > 5000) {
            callback(
              new Error("Комментарий не должен превышать 5000 символов.")
            );
            return;
          }
          callback();
        },
        trigger: ["change", "input"],
      },
    ],
    id_kis_art: [
      {
        validator: validateKISField("id_kis_art", "Введите номер ID КИС"),
        trigger: ["blur", "change"],
      },
    ],
    kis_art_issued: [
      {
        validator: validateKISField(
          "kis_art_issued",
          "Выберите дату выдачи ID КИС"
        ),
        trigger: ["blur", "change"],
      },
    ],
    kis_art_expires: [
      {
        validator: validateKISField(
          "kis_art_expires",
          "Выберите дату окончания ID КИС"
        ),
        trigger: ["blur", "change"],
      },
    ],
  });

  const licenceFormPartDefault = {
    country_code: null,
    series: "",
    number: "",
    combinedSeriesAndNumber: "",
    issued_date: null,
    issued_by: "",
    expired_date: null,
    categories: [],
    experienceYears: null,
    driving_experience_from: null,
  };
  const licenceFormPart = ref<t.IDriverLicence>({
    ...licenceFormPartDefault,
  });
  const licenceFormPartRef = ref<FormInstance>();
  const licenceFormPartRules = computed<FormRules>(() => ({
    country_code: [
      /* {
        required: true,
        message: "Пожалуйста, выберите страну",
        trigger: "change",
      }, */
    ],
    driverCategory: [
      // {
      //   required: true,
      //   message: "Пожалуйста, введите категория",
      //   trigger: "change",
      // },
    ],
    combinedSeriesAndNumber: [
      /* {
        required: true,
        message: "Пожалуйста, введите категория",
        trigger: "change",
      }, */
    ],
    series: [
      {
        required: false,
        message: "Введите серию",
        trigger: ["change", "blur"],
      },
      {
        validator: (rule, value, callback) => {
          if (isImportedDraft.value) return callback();
          if (!value) return callback(); //not required

          const cc = licenceFormPart.value.country_code;
          if (cc === "KZ" || cc === "UZ") {
            if (!/^[a-zA-Z]*$/.test(value)) {
              callback(new Error("В серии В/У допустимы только буквы"));
            } else {
              callback();
            }
          } else {
            if (!/^\d+$/.test(value)) {
              callback(new Error("В серии В/У допустимы только цифры"));
            } else if (value.length !== 4) {
              callback(new Error("Серия В/У должна состоять из 4 цифр"));
            } else {
              callback();
            }
          }
        },
        trigger: ["change", "blur"],
      },
      {
        //  max: 4,
        // message: "Серия В/У должна состоять из 4 цифр",
        trigger: ["blur", "change"],
        validator: (rule, value, callback) => {
          if (isImportedDraft.value) return callback();
          if (!value) return callback(); //not required

          const cc = licenceFormPart.value.country_code;
          if (cc === "KZ") return callback();
          if (cc === "UZ") {
            if (value.length > 2)
              return callback(new Error("Серия В/У должна состоять из 2 букв"));
            return callback();
          }
          if (value.length > 4)
            return callback(new Error("Серия В/У должна состоять из 4 цифр"));
          callback();
        },
      },
      {
        // min: 4,
        // message: "Серия В/У должна состоять из 4 цифр",
        trigger: ["blur"],
        validator: (rule, value, callback) => {
          if (isImportedDraft.value) return callback();
          if (!value) return callback(); //not required

          const cc = licenceFormPart.value.country_code;
          if (cc === "KZ") return callback();
          if (cc === "UZ") {
            if (value.length < 2)
              return callback(new Error("Серия UZ — ровно 2 буквы"));
            return callback();
          }
          if (value.length < 4)
            return callback(new Error("Серия В/У должна состоять из 4 цифр"));
          callback();
        },
      },
    ],
    number: [
      { required: false, message: "Введите номер", trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (!value) return callback(); //not required

          if (licenceFormPart.value.country_code === "KG" || licenceFormPart.value.country_code === "TJ") return callback();

          if (!/^\d+$/.test(value)) {
            callback(new Error("В номере В/У допустимы только цифры"));
          } else {
            callback();
          }
        },
        trigger: ["change", "blur"],
      },
      {
        // max: 6,
        // message: "Номер В/У должен состоять из 6 цифр",
        trigger: ["blur", "change"],
        validator: (rule, value, callback) => {
          if (!value) return callback(); //not required

          if (licenceFormPart.value.country_code === "KG" || licenceFormPart.value.country_code === "TJ") return callback();
          const cc = licenceFormPart.value.country_code;
          if (cc === "UZ") {
            if (value.length > 7)
              return callback(
                new Error("Номер В/У должен состоять из 6-7 цифр")
              );
            return callback();
          }
          if (value.length > 6)
            return callback(new Error("Номер В/У должен состоять из 6 цифр"));
          callback();
        },
      },
      {
        // min: 6,
        // message: "Номер В/У должен состоять из 6 цифр",
        trigger: ["blur"],
        validator: (rule, value, callback) => {
          if (!value) return callback(); //not required

          if (licenceFormPart.value.country_code === "KG" || licenceFormPart.value.country_code === "TJ") return callback();
          const cc = licenceFormPart.value.country_code;
          if (cc === "UZ") {
            if (value.length < 6)
              return callback(
                new Error("Номер В/У должен состоять из 6-7 цифр")
              );
            return callback();
          }
          if (value.length < 6)
            return callback(new Error("Номер В/У должен состоять из 6 цифр"));
          callback();
        },
      },
    ],
    issued_date: [
      /* {
        required: true,
        message: "Пожалуйста, введите дату выдачи",
        trigger: "change",
      }, */
    ],
    expired_date: [
      /* {
        required: true,
        message: "Пожалуйста, введите дату окончания",
        trigger: "change",
      }, */
    ],
    issued_by: [
      {
        required: true,
        message: "Пожалуйста, введите кем выданы",
        trigger: "blur",
      },
    ],
    categories: [
      {
        required: true,
        message: "Пожалуйста, выберите категории",
        trigger: "change",
      },
    ],
    experienceYears: [],
    driving_experience_from: [
      /* {
        required: true,
        message: "Пожалуйста, введите стаж",
        trigger: "blur",
      }, */
    ],
  }));
  const clearLicenceFormPart = () => {
    licenceFormPart.value = { ...licenceFormPartDefault };
  };

  const accrualsFormPartDefault: t.IDriverAccrualsPart = {
    fines_enable_accruals: null,
    toll_roads_enable_accruals: null,
  };
  const accrualsFormPart = ref<t.IDriverAccrualsPart>({
    ...accrualsFormPartDefault,
  });
  const accrualsFormPartRef = ref<FormInstance>();
  const accrualsFormPartRules = ref<FormRules>({
    fines_enable_accruals: [
      {
        required: false,
        message: "Пожалуйста, выберите включение начисления штрафов",
        trigger: "change",
      },
    ],
    toll_roads_enable_accruals: [
      {
        required: false,
        message: "Пожалуйста, выберите включение начисления за платные дороги",
        trigger: "change",
      },
    ],
  });

  const clearAccrualsFormPart = () => {
    accrualsFormPart.value = { ...accrualsFormPartDefault };
  };

  const autoDamageFormPartDefault: t.IDriverDamagePart = {
    damage_cost_by_damage_price: null,
  };

  const autoDamageFormPart = ref<t.IDriverDamagePart>({
    ...autoDamageFormPartDefault,
  });

  const settlementsFormPartDefault = {
    max_franchise: undefined,
    max_deposit: undefined,
    accrual_processing_time_local: undefined,
  };
  const settlementsFormPart = ref<t.IDriverSettlementsPart>({
    ...settlementsFormPartDefault,
  });
  const settlementsFormPartRef = ref<FormInstance>();
  const settlementsFormPartRules = reactive<FormRules>({
    maxFranchise: [
      {
        required: false,
        message: "Введите Максимальную сумму депозита",
        trigger: "blur",
      },
    ],
    maxDeposit: [
      {
        required: false,
        message: "Введите Максимальную сумму франшизы",
        trigger: "blur",
      },
    ],
  });
  const clearSettlementsFormPart = () => {
    settlementsFormPart.value = { ...settlementsFormPartDefault };
  };

  const drivers = computed<t.IDriver[]>(() => {
    return (
      driversResponse.value?.items?.map((d) => ({
        ...d,
        fullname: getUserFullname(d.lastname, d.firstname, d.middlename),
      })) ?? []
    );
  });
  const clear = () => {
    validateError.value = false;
    clearLicenceFormPart();
    clearPassportFormPart();
    clearPassportFormPart();
    clearContactsDataFormPart();
    clearOtherDataFormPart();
    clearAllDocuments();
    clearDriverFilesLists();
    clearSettlementsFormPart();
    clearAccrualsFormPart();
  };

  const driversTotalItems = computed(
    () => driversResponse.value?.total_items ?? 0
  );

  const driverStatus = ref<t.IDriverStatus>({
    status: t.EDriverStatus.applicant,
    status_reason: null,
    status_comment: "",
  });

  const driverStatusData = computed(() => {
    return {
      status: driverStatus.value.status,
      status_reason: driverStatus.value.status_reason,
      status_comment: driverStatus.value.status_comment,
      type: getDriverStatusType(driverStatus.value.status),
      label: getDriverStatusLabel(driverStatus.value.status),
      value: driverStatus.value.status,
    };
  });

  const driverDetailsId = computed(() => {
    const id = route.hash?.split("/")[2];
    return id ? Number(id) : undefined;
  });
  const driverStatusesDetailList = computed<t.IDriverStatusesDetails[]>(() => {
    return driverStatusesDetailResult.value?.items ?? [];
  });
  const driverStatusesDetailListTotalItems = computed(
    () => driverStatusesDetailResult.value?.total_items ?? 0
  );
  const clearDriverStatusesDetails = () =>
    (driverStatusesDetailResult.value = undefined);

  watch(detailResult, (v) => {
    if (v) {
      clear();
      // Object.keys(v).forEach((key) => {
      //   // @ts-ignore
      //   passportFormPart.value[key] = v[key];
      // });

      (
        Object.keys(passportFormPart.value) as (keyof t.IDriverPassportPart)[]
      ).forEach((key) => {
        passportFormPart.value[key] = v[key] as never;
      });
      passportFormPart.value.passport_personal_number =
        v.passport_personal_number;
      passportFormPart.value.passport_expires_at = v.passport_expires_at;

      (
        Object.keys(licenceFormPart.value) as (keyof t.IDriverLicence)[]
      ).forEach((key) => {
        licenceFormPart.value[key] = v.licence[key] as never;
      });
      licenceFormPart.value.extra_aps = v.licence.extra_aps;
      licenceFormPart.value.extra_at = v.licence.extra_at;
      licenceFormPart.value.extra_bn = v.licence.extra_bn;
      licenceFormPart.value.extra_gcl = v.licence.extra_gcl;
      licenceFormPart.value.extra_hacf = v.licence.extra_hacf;
      licenceFormPart.value.extra_med = v.licence.extra_med;
      licenceFormPart.value.extra_mt = v.licence.extra_mt;
      if (licenceFormPart.value.categories.includes("B")) {
        if (detailResult.value?.licence.extra_at) {
          licenceFormPart.value.driverCategory = "B/AT";
        } else {
          licenceFormPart.value.driverCategory = "B";
        }
      } else {
        licenceFormPart.value.driverCategory = "";
      }

      licenceFormPart.value.extra_at = detailResult.value?.licence.extra_at;
      licenceFormPart.value.extra_mt = detailResult.value?.licence.extra_mt;
      licenceFormPart.value.extra_aps = detailResult.value?.licence.extra_aps;
      licenceFormPart.value.extra_gcl = detailResult.value?.licence.extra_gcl;
      licenceFormPart.value.extra_hacf = detailResult.value?.licence.extra_hacf;
      licenceFormPart.value.extra_med = detailResult.value?.licence.extra_med;
      licenceFormPart.value.extra_bn = detailResult.value?.licence.extra_bn;

      (
        Object.keys(otherDataFormPart.value) as (keyof Omit<
          t.IDriverOther,
          "driver_category"
        >)[]
      ).forEach((key) => {
        otherDataFormPart.value[key] = v[key] as never;
      });

      (
        Object.keys(contactsDataFormPart.value) as (keyof t.IDriverContacts)[]
      ).forEach((key) => {
        contactsDataFormPart.value[key] = v[key] as never;
      });
      contactsDataFormPart.value.email = v.email;

      driverStatus.value.status =
        detailResult.value?.status.status ?? t.EDriverStatus.applicant;
      allDocuments.value = v.document_ids?.length ? [...v.document_ids] : [];
      licenceFormPart.value.experienceYears = dayjs().diff(
        v.driving_experience_from,
        "year"
      );

      console.log({ v });
      otherDataFormPart.value.contract_date = v.contract_date;
      otherDataFormPart.value.contract_number = v.contract_number;
      otherDataFormPart.value.driver_category = v.category.category;
      otherDataFormPart.value.criminal_issued_date = v.criminal_issued_date;
      otherDataFormPart.value.criminal_record_number = v.criminal_record_number;
      otherDataFormPart.value.medical_certificate_date =
        v.medical_certificate_date;
      otherDataFormPart.value.medical_certificate_number =
        v.medical_certificate_number;
      otherDataFormPart.value.medical_certificate_expires_at =
        v.medical_certificate_expires_at;

      console.log(dayjs().diff(v.driving_experience_from, "year"));
      otherDataFormPart.value.block_debit_funds_from_taxi_aggregator =
        v.block_debit_funds_from_taxi_aggregator;
      settlementsFormPart.value.max_franchise = v.max_franchise;
      settlementsFormPart.value.max_deposit = v.max_deposit;
      settlementsFormPart.value.accrual_processing_time_local =
        v.accrual_processing_time_local;
      accrualsFormPart.value.fines_enable_accruals = v.fines_enable_accruals;
      accrualsFormPart.value.toll_roads_enable_accruals =
        v.toll_roads_enable_accruals;
      autoDamageFormPart.value.damage_cost_by_damage_price =
        v.damage_cost_by_damage_price;
    }
  });

  const { isImportedDraft } = storeToRefs(useIntegrationsImportStore());

  const setDriverDraftData = (v: t.IDriverCreateForm) => {
    Object.keys(v).forEach((key) => {
      // @ts-ignore
      if (typeof v[key] === "undefined") return;
      // @ts-ignore
      passportFormPart.value[key] = v[key];
    });
    passportFormPart.value.passport_personal_number =
      v.passport_personal_number;
    passportFormPart.value.passport_expires_at = v.passport_expires_at;

    (
      Object.keys(passportFormPart.value) as (keyof t.IDriverPassportPart)[]
    ).forEach((key) => {
      // @ts-ignore
      if (typeof v[key] === "undefined") return;
      passportFormPart.value[key] = v[key] as never;
    });

    (Object.keys(licenceFormPart.value) as (keyof t.IDriverLicence)[]).forEach(
      (key) => {
        // @ts-ignore
        if (typeof v[key] === "undefined" && !isImportedDraft.value) return;
        licenceFormPart.value[key] = v?.licence[key] as never;
      }
    );

    (Object.keys(otherDataFormPart.value) as (keyof t.IDriverOther)[]).forEach(
      (key) => {
        // @ts-ignore
        if (typeof v[key] === "undefined") return;
        otherDataFormPart.value[key] = v[key] as never;
      }
    );

    (
      Object.keys(contactsDataFormPart.value) as (keyof t.IDriverContacts)[]
    ).forEach((key) => {
      // @ts-ignore
      if (typeof v[key] === "undefined") return;
      contactsDataFormPart.value[key] = v[key] as never;
    });

    driverStatus.value.status = v.driver_status ?? t.EDriverStatus.applicant;
    allDocuments.value = v?.document_ids?.length ? [...v.document_ids] : [];
  };

  watch(
    () => route.hash,
    (v) => {
      if (v === EDrawerRouteHash.DriversCreate) {
        if (Boolean(selectedDraftDriver.value) || Boolean(newDraft.value)) {
          return;
        }
        clear();
      }
      // if (v?.includes(EDrawerRouteHash.DriversDetails)) {
      //   fetchDetail({
      //     driver_id: Number(v.split("/")[2]),
      //   });
      // }
      return;
    },
    { immediate: true }
  );

  const getDriverStatusType = (
    status: t.EDriverStatus
  ): TDefaultElPlusTypes | undefined => {
    switch (status) {
      case t.EDriverStatus.hired:
        return "success";
      case t.EDriverStatus.applicant:
        return "primary";
      case t.EDriverStatus.under_inspection:
        return "warning";
      case t.EDriverStatus.refused:
        return "info";
      case t.EDriverStatus.fired:
        return "danger";
      default:
        break;
    }
  };

  const getDriverStatusLabel = (status: t.EDriverStatus) => {
    switch (status) {
      case t.EDriverStatus.hired:
        return "Принят";
      case t.EDriverStatus.applicant:
        return "Претендент";
      case t.EDriverStatus.under_inspection:
        return "На проверке";
      case t.EDriverStatus.refused:
        return "Отказ";
      case t.EDriverStatus.fired:
        return "Уволен";
      default:
        break;
    }
  };

  const getTaxStatusLabel = (taxStatus: string) => {
    switch (taxStatus) {
      case "individual":
        return "Физ. лицо";
      case "self_employed":
        return "Самозанятый";
      case "individual_entrepreneur":
        return "ИП";
      case "individual_entrepreneur_and_self_employed":
        return "ИП и самозанятый";
      default:
        break;
    }
  };

  const getCategoryLabel = (category: t.TDriverCategoryType) => {
    switch (category) {
      case "tenant":
        return "Арендатор";
      case "staff":
        return "Сотрудник";
      case "involved":
        return "Привлеченный";
      default:
        return category;
    }
  };

  const getDriverDocsByType = (type: TFilesType) => {
    return detailResult.value?.documents?.filter((f) => f.type === type) ?? [];
  };

  const getDriverShortCardInfo = (driver: t.IDriver | undefined) => {
    if (!driver) return [];

    return [
      {
        label: "Мед. справка до",
        value: driver?.medical_certificate_expires_at
          ? formatDay(driver?.medical_certificate_expires_at)
          : "-",
      },
      { label: "В/У до", value: formatDay(driver?.licence?.expired_date) },
      {
        label: "Задолженность",
        value:
          Number(driver.balance) > 0
            ? formatCurrency(0)
            : formatCurrency(Number(driver.balance)),
      },
    ];
  };

  watch(passportFormPart, () => {
    console.log({ passportFormPart: passportFormPart.value });
    if (passportFormPart.value.passport_issued_date?.length == 2) {
      passportFormPart.value = {
        ...passportFormPart.value,
        passport_issued_date: passportFormPart.value.passport_issued_date + ".",
      };
    }
  });

  const downloadDrivers = async (data: t.IDriversListParams): Promise<void> => {
    const { query, statuses, order_by, direction } = data;
    try {
      const params = new URLSearchParams();

      if (query) params.append("query", String(query));
      if (statuses) params.append("statuses", String(statuses));
      if (order_by) params.append("order_by", String(order_by));
      if (direction) params.append("direction", String(direction));

      const result = await axios.get(`${MAIN_ENDPOINT}api/v1/drivers/report`, {
        params,
        responseType: "blob",
      });

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `driver_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Список водителей получен",
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

  const downloadDriverOperations = async (driver_id: string): Promise<void> => {
    try {
      const result = await axios.get(
        `${MAIN_ENDPOINT}api/v1/drivers/${driver_id}/balance_aggregate/report`,
        {
          responseType: "blob",
        }
      );

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `driver_operations_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Список общего баланса получен",
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
    loading: fetchDriverIntegrationsLoading,
    response: driverIntegrationsResponse,
    request: fetchDriverIntegrations,
  } = useApi<
    IPagination<t.IDriverIntegration>,
    t.IDriverIntegrationsListParams
  >({
    dynamicUrl: (p) => `/api/v1/integrations_driver/${p.driver_id}`,
    method: "GET",
  });

  const {
    loading: createDriverIntegrationLoading,
    error: createDriverIntegrationError,
    response: newDriverIntegration,
    request: createDriverIntegrationRequest,
  } = useApi<
    t.IDriverIntegration,
    t.IDriverIntegrationCreateForm & { driver_id: number }
  >({
    dynamicUrl: (p) => `/api/v1/integrations_driver/${p.driver_id}`,
    method: "POST",
  });

  const {
    loading: updateDriverIntegrationLoading,
    error: updateDriverIntegrationError,
    response: updatedDriverIntegration,
    request: updateDriverIntegrationRequest,
  } = useApi<
    t.IDriverIntegration,
    t.IDriverIntegrationUpdateForm & t.IDriverIntegrationDetailParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/integrations_driver/${p.driver_id}/${p.integration_driver_id}`,
    method: "PUT",
  });

  const {
    loading: deleteDriverIntegrationLoading,
    error: deleteDriverIntegrationError,
    request: deleteDriverIntegrationRequest,
  } = useApi<void, t.IDriverIntegrationDetailParams>({
    dynamicUrl: (p) =>
      `/api/v1/integrations_driver/${p.driver_id}/${p.integration_driver_id}`,
    method: "DELETE",
  });

  // Driver Debit Funds Settings

  const {
    loading: fetchDriverDebitFundsSettingsLoading,
    response: driverDebitFundsSettings,
    request: fetchDriverDebitFundsSettings,
  } = useApi<
    IDebitFundsSettings,
    {
      operation_category: TBalanceOperationsCategory;
      driver_id: number;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/driver_debit_funds_settings/${p.driver_id}/${p.operation_category}`,
    method: "GET",
  });

  const {
    loading: createDriverDebitFundsSettingsLoading,
    response: createDriverDebitFundsSettingsResponse,
    request: createDriverDebitFundsSettings,
  } = useApi<IDebitFundsSettings, IDebitFundsSettingsCreateForm>({
    dynamicUrl: (p) =>
      `/api/v1/driver_debit_funds_settings/${p.driver_id}/${p.operation_category}`,
    method: "POST",
  });

  const {
    loading: updateDriverDebitFundsSettingsLoading,
    response: updateDriverDebitFundsSettingsResponse,
    request: updateDriverDebitFundsSettings,
  } = useApi<IDebitFundsSettings, IDebitFundsSettingsUpdateForm>({
    dynamicUrl: (p) =>
      `/api/v1/driver_debit_funds_settings/${p.driver_id}/${p.operation_category}`,
    method: "PUT",
  });

  const {
    loading: deleteDriverDebitFundsSettingsLoading,
    response: deleteDriverDebitFundsSettingsResponse,
    request: deleteDriverDebitFundsSettings,
  } = useApi<void, IDebitFundsSettingsDelete>({
    dynamicUrl: (p) =>
      `/api/v1/driver_debit_funds_settings/${p.driver_id}/${p.operation_category}`,
    method: "DELETE",
  });

  return {
    // driver debit funds settings
    fetchDriverDebitFundsSettingsLoading,
    driverDebitFundsSettings,
    fetchDriverDebitFundsSettings,

    createDriverDebitFundsSettingsLoading,
    createDriverDebitFundsSettingsResponse,
    createDriverDebitFundsSettings,

    updateDriverDebitFundsSettingsLoading,
    updateDriverDebitFundsSettingsResponse,
    updateDriverDebitFundsSettings,

    deleteDriverDebitFundsSettingsLoading,
    deleteDriverDebitFundsSettingsResponse,
    deleteDriverDebitFundsSettings,

    // driver
    passportFormPart,
    passportFormPartRef,
    passportFormPartRules,
    clearPassportFormPart,

    licenceFormPart,
    licenceFormPartRef,
    licenceFormPartRules,

    otherDataFormPart,
    otherDataFormPartRef,
    otherDataFormPartRules,

    settlementsFormPart,
    settlementsFormPartRef,
    settlementsFormPartRules,
    clearSettlementsFormPart,

    accrualsFormPart,
    accrualsFormPartRef,
    accrualsFormPartRules,

    autoDamageFormPart,

    contactsDataFormPart,
    contactsDataFormPartRef,
    contactsDataFormPartRules,

    allDocuments,
    driverPhotoFileList,
    passportFileList,
    registrationFileList,
    medicalCertificateFileList,
    criminalRecordFileList,
    licenseFileList,
    additionalFileList,
    handleRemoveFile,
    uploadDriverPhotoFileList,
    uploadPassportFileList,
    uploadRegistrationFileList,
    uploadMedicalCertificateFileList,
    uploadCriminalRecordFileList,
    uploadAdditionalFileList,
    uploadLicenseFileList,
    updateDriverLoading,
    detailLoading,
    detailResult,
    fetchDetail,

    drivers,
    newDriver,
    updateDriverResponse,

    updateDriverLicence,

    driverStatus,
    driverStatusData,
    updateDriverStatusResponse,
    updateDriverStatusLoading,
    updateDriverStatus,

    driverStatusesDetailLoading,
    driverStatusesDetailList,
    driverStatusesDetailListTotalItems,
    fetchDriverStatusesDetail,
    clearDriverStatusesDetails,

    driversTotalItems,
    driverDetailsId,

    fetchDriversLoading,
    createDriverLoading,

    validateError,
    validateForm,
    createDriver,
    updateDriver,
    fetchDrivers,
    clear,
    serializeDriverDataToServer,
    setDriverDraftData,

    getDriverStatusType,
    getDriverStatusLabel,
    getDriverDocsByType,
    getTaxStatusLabel,
    getCategoryLabel,
    getDriverShortCardInfo,

    downloadDrivers,
    downloadDriverOperations,

    fetchDriverIntegrations,
    fetchDriverIntegrationsLoading,
    driverIntegrationsResponse,
    createDriverIntegrationRequest,
    createDriverIntegrationLoading,
    createDriverIntegrationError,
    updateDriverIntegrationRequest,
    updateDriverIntegrationLoading,
    updateDriverIntegrationError,
    deleteDriverIntegrationRequest,
    deleteDriverIntegrationLoading,
    deleteDriverIntegrationError,
  };
};

export const useDriverRelatives = () => {
  const {
    loading: createDriverRelativeLoading,
    error: createDriverRelativeError,
    response: createDriverRelativeResponse,
    request: createDriverRelativeRequest,
  } = useApi<t.IDriverRelative, t.IDriverRelativeParams>({
    dynamicUrl: (p) => `/api/v1/driver_relatives/${p.driver_id}`,
    method: "POST",
  });

  const {
    loading: driverRelativesLoading,
    error: driverRelativesError,
    response: driverRelatives,
    request: fetchDriverRelatives,
  } = useApi<IPagination<t.IDriverRelative>, t.IDriverRelativesListParams>({
    dynamicUrl: (p) => `/api/v1/driver_relatives/${p.driver_id}`,
    method: "GET",
  });

  const {
    loading: updateDriverRelativeLoading,
    error: updateDriverRelativeError,
    response: updateDriverRelativeResponse,
    request: updateDriverRelativeRequest,
  } = useApi<t.IDriverRelative, t.IDriverRelativeUpdateParams>({
    dynamicUrl: (p) => `/api/v1/driver_relatives/${p.relative_id}`,
    method: "PATCH",
  });

  const {
    loading: deleteDriverRelativeLoading,
    error: deleteDriverRelativeError,
    response: deleteDriverRelativeResponses,
    request: deleteDriverRelativeRequest,
  } = useApi<string, { relative_id: Number }>({
    dynamicUrl: (p) => `/api/v1/driver_relatives/${p.relative_id}`,
    method: "DELETE",
  });

  const { detailResult } = storeToRefs(useDriversStore());

  const driverRelativeFormDefault: t.IDriverRelative = {
    id: 0,
    phone: "",
    firstname: "",
    lastname: "",
    middlename: "",
    degree: "",
  };
  const driverRelativeForm = ref<t.IDriverRelative>({
    ...driverRelativeFormDefault,
  });

  const cleardriverRelativeForm = () => {
    driverRelativeForm.value = { ...driverRelativeFormDefault };
  };

  const createDriverRelative = async (
    relativeData: t.IDriverRelative
  ): Promise<void> => {
    try {
      await createDriverRelativeRequest({
        ...relativeData,
        driver_id: detailResult.value?.id!,
        phone: cleanPhoneNumber(relativeData.phone),
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно добавлены",
        type: "success",
      });
      await fetchDriverRelatives({
        driver_id: detailResult.value?.id!,
        limit: 20,
        page: 1,
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: createDriverRelativeError.value?.title ?? "Ошибка",
        message:
          createDriverRelativeError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const updateDriverRelative = async (
    relativeData: t.IDriverRelative
  ): Promise<void> => {
    try {
      await updateDriverRelativeRequest({
        ...relativeData,
        relative_id: relativeData.id,
        phone: cleanPhoneNumber(relativeData.phone),
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Данные успешно обновлены",
        type: "success",
      });
      await fetchDriverRelatives({
        driver_id: detailResult.value?.id!,
        limit: 20,
        page: 1,
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: updateDriverRelativeError.value?.title ?? "Ошибка",
        message:
          updateDriverRelativeError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const deleteDriverRelative = async (id: number): Promise<void> => {
    try {
      await deleteDriverRelativeRequest({
        relative_id: id,
      });
      await fetchDriverRelatives({
        driver_id: detailResult.value?.id!,
        limit: 20,
        page: 1,
      });
      ElNotification({
        title: "Успешный запрос",
        message: "Контакт успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteDriverRelativeError.value?.title ?? "Ошибка",
        message:
          deleteDriverRelativeError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const driverRelativesData = computed(() => {
    return driverRelatives.value?.items ?? [];
  });

  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, "").replace(/^7/, "7");
  };

  return {
    driverRelativeForm,
    driverRelativesData,
    driverRelativesLoading,
    createDriverRelative,
    updateDriverRelative,
    cleardriverRelativeForm,
    fetchDriverRelatives,
    deleteDriverRelative,
  };
};

export const useDriverBalanceAggegate = () => {
  const {
    loading: driverBalanceAgregateLoading,
    error: driverBalanceAgregateError,
    response: driverBalanceAgregates,
    request: fetchDriverBalanceAgregate,
  } = useApi<t.IDriverBalanceAgregate[], { id: string }>({
    dynamicUrl: (p) => `/api/v1/drivers/${p.id}/balance_aggregate`,
    method: "GET",
  });
  const {
    loading: driverAggregatorsBalanceLoading,
    error: driverAggregatorsBalanceError,
    response: driverAggregatorsBalance,
    request: fetchDriverAggregatorsBalance,
  } = useApi<t.IDriverAggregatorBalance[], { id: string }>({
    dynamicUrl: (p) => `/api/v1/drivers_external_balance/${p.id}`,
    method: "GET",
  });

  const operationCategoryFilterValue = ref<TBalanceOperationsCategory>();

  return {
    operationCategoryFilterValue,

    driverBalanceAgregateLoading,
    driverBalanceAgregates,
    fetchDriverBalanceAgregate,

    driverAggregatorsBalanceLoading,
    driverAggregatorsBalance,
    fetchDriverAggregatorsBalance,
  };
};

export const useDriverAppAccess = () => {
  const {
    loading: driverAppAccessLoading,
    response: driverAppAccess,
    request: fetchDriverAppAccess,
  } = useApi<t.IDriverAppAccess, { driver_id: string | number }>({
    dynamicUrl: (p) => `/api/v1/driver_app/access/${p.driver_id}`,
    method: "GET",
  });
  const {
    loading: driverGrantAppAccessLoading,
    response: driverGrantAppAccessResp,
    error: driverGrantAppAccessErr,
    request: addGrantDriverAppAccessRequest,
  } = useApi<t.IDriverAppAccess, t.IDriverAppAccessForm>({
    dynamicUrl: (p) => `/api/v1/driver_app/access/${p.driver_id}/grant`,
    method: "POST",
    postQueryParams: true,
  });
  const {
    loading: driverRevokeAppAccessLoading,
    request: revokeDriverAppAccessRequest,
  } = useApi<t.IDriverAppAccess, { driver_id: string | number }>({
    dynamicUrl: (p) => `/api/v1/driver_app/access/${p.driver_id}/revoke`,
    method: "POST",
  });

  const driverHasAccess = computed(() => {
    return Boolean(driverAppAccess.value?.company_group_id);
  });
  const accessLoading = computed(() => {
    return (
      driverAppAccessLoading.value ||
      driverGrantAppAccessLoading.value ||
      driverRevokeAppAccessLoading.value
    );
  });

  const addGrantDriverAppAccess = async (form: t.IDriverAppAccessForm) => {
    try {
      await addGrantDriverAppAccessRequest({
        ...form,
        phone: form.phone.replace(/\D/g, ""),
      });
      driverAppAccess.value = _.cloneDeep(driverGrantAppAccessResp.value);
    } catch (error) {
      ElNotification({
        title: driverGrantAppAccessErr.value?.title ?? "Ошибка",
        message:
          driverGrantAppAccessErr.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };
  const revokeDriverAppAccess = async ({
    driver_id,
  }: {
    driver_id: string | number;
  }) => {
    try {
      await revokeDriverAppAccessRequest({
        driver_id,
      });
      driverAppAccess.value = undefined;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    driverHasAccess,
    accessLoading,

    fetchDriverAppAccess,
    addGrantDriverAppAccess,
    revokeDriverAppAccess,
  };
};

import { computed, ref, reactive, watch } from "vue";
import {
  ElNotification,
  dayjs,
  type FormInstance,
  type FormRules,
  type UploadFile,
  type UploadFiles,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";

import useApi from "@/composables/useApi";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";
import {
  formatDateToServer,
  formatDateTimeToServer,
} from "@/helpers/format.helpers";

import * as t from "@/types/fines";
import type { IPagination } from "@/types/apiDefault";
import { useFiles, type IUploadedServerFile } from "./useFiles";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";
const { downloadFile } = useFiles();

export const useFines = () => {
  const {
    loading: finesListLoading,
    response: finesResponse,
    request: fetchFinesList,
  } = useApi<IPagination<t.IFine>, t.IFineListParams>({
    url: "/api/v1/fines",
    method: "GET",
  });
  const {
    loading: fineDetailsLoading,
    response: fineDetailsResult,
    request: fetchFineDetails,
  } = useApi<t.IFine, t.IFineDetailsParams>({
    dynamicUrl: (p) => `/api/v1/fines/${p.fine_id}`,
    method: "GET",
  });
  const {
    loading: createFineLoading,
    error: createFineError,
    response: newFine,
    request: createFineRequest,
  } = useApi<t.IFine, t.IFineForm>({
    url: "/api/v1/fines",
    method: "POST",
  });
  const {
    loading: accrualFineLoading,
    error: accrualFineError,
    response: newAccrualFine,
    request: updateAccrualFineRequest,
  } = useApi<{ id: string }>({
    method: "POST",
    dynamicUrl: (p) => `/api/v1/fines/${p.id}/accrual`,
  });
  const {
    response: downloadFinesDocumentsResponse,
    loading: downloadFinesDocumentsLoading,
    request: downloadFinesDocumentsRequest,
    error: downloadFinesDocumentsError,
  } = useApi<
    Blob,
    {
      counterparty_id: number;
      requisite_id: number;
      fines_ids: number[];
    }
  >({
    method: "GET",
    responseType: "blob",
    dynamicUrl: (p) =>
      `/api/v1/fines/${p.counterparty_id}/generate_payment_document`,
  });
  const {
    response: updateFineResponse,
    loading: updateFineLoading,
    request: updateFineRequest,
    error: updateFineError,
  } = useApi<t.IFine, t.IFineEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/fines/${p.id}`,
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const { uploadFileList } = useFiles();

  const initialFinesParams: t.IFineListParams = {
    no_driver: false,
    counterparty_id: undefined,
    statuses: undefined,
    local_statuses: undefined,
    driver_id: undefined,
    datetime_start: undefined,
    datetime_end: undefined,
    datetime_type: "created_at",
    query: "",
    order_by: "created_at",
    direction: "desc",
    limit: 20,
    page: 1,
  };
  const emptyFinesForm: t.IFineForm = {
    number: "",
    company_id: undefined,
    vehicle_id: undefined,
    driver_id: undefined,
    price: "",
    discount_price: null,
    commission: "",
    koap_code: null,
    koap_text: null,
    status: "",
    local_status: "",
    bill_date: "",
    issued_date: "",
    discount_expires_at: "",
    comment: "",
    document_ids: [],
  };
  const finesRef = ref<FormInstance>();
  const finesRules = reactive<FormRules>({
    number: [
      { required: true, message: "Введите № постановления", trigger: "blur" },
    ],
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    /* driver_id: [
      {
        required: true,
        message: "Выберите водителя",
        trigger: "change",
      },
    ], */
    company_id: [
      {
        required: true,
        message: "Выберите эксплуатанта",
        trigger: "change",
      },
    ],
    price: [
      { required: true, message: "Введите cуммy штрафа", trigger: "blur" },
    ],
    // discount_price: [
    //   {
    //     required: true,
    //     message: "Введите cуммy штрафа cо скидкой",
    //     trigger: "blur",
    //   },
    // ],
    // commission: [
    //   { required: true, message: "Введите Комиссию", trigger: "blur" },
    // ],
    status: [
      {
        required: true,
        message: "Выберите Статус в ГИБДД",
        trigger: "change",
      },
    ],
    local_status: [
      {
        required: true,
        message: "Выберите Статус водителя",
        trigger: "change",
      },
    ],
    bill_date: [
      {
        required: true,
        message: "Введите дату постановления",
        trigger: "change",
      },
    ],
    issued_date: [
      {
        required: true,
        message: "Введите дату штрафа",
        trigger: "change",
      },
    ],
    // discount_expires_at: [
    //   {
    //     required: true,
    //     message: "Введите дату окончания скидки",
    //     trigger: "change",
    //   },
    // ],
  });
  const finesUpdateRules = reactive<FormRules>({
    ...finesRules,
    discount_price: undefined,
  });
  const finesForm = ref({
    ...emptyFinesForm,
  });

  const finesList = computed<t.IFine[]>(() => {
    return finesResponse.value?.items ?? [];
  });
  const finesListTotalItems = computed(
    () => finesResponse.value?.total_items ?? 0,
  );

  const clear = () => {
    finesForm.value = { ...emptyFinesForm };
    finesFileList.value = [];
  };
  watch(fineDetailsResult, (v) => {
    if (v) {
      clear();
      const keys = Object.keys(v) as (keyof t.IFineForm)[];
      keys.forEach((key) => {
        if (key in finesForm.value) {
          // @ts-ignore
          finesForm.value[key] = v[key];
          if (key === "issued_date") {
            finesForm.value[key] = dayjs(v[key], { utc: true })
              .local()
              .format();
          }
        }
      });
    }
  });

  const finesFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const pendingFiles = ref<UploadUserFile[]>([]);
  let uploadTimeout: any = null;

  const uploadFinesFileList = (
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

      const uploaded = await uploadFileList(pendingFiles.value, "FINE_PHOTO");

      if (uploaded?.length) {
        finesForm.value.document_ids = [
          ...finesForm.value.document_ids,
          ...uploaded.map((f) => f.id),
        ];

        finesFileList.value = [
          ...finesFileList.value.filter((f) => (f as any).id),
          ...uploaded,
        ];
      }

      // Очищаем буфер
      pendingFiles.value = [];
    }, 300);
  };

  const handleRemoveFinesFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      finesForm.value.document_ids = finesForm.value.document_ids.filter(
        (f) => f !== id,
      );
  };

  const createFine = async (): Promise<void> => {
    validatePromise(finesRef.value!).then(async () => {
      try {
        await createFineRequest({
          ...finesForm.value,
          bill_date: formatDateToServer(finesForm.value.bill_date)!,
          issued_date: formatDateTimeToServer(finesForm.value.issued_date)!,
          discount_expires_at: formatDateToServer(
            finesForm.value.discount_expires_at,
          )!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Штраф добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createFineError.value?.title ?? "Ошибка",
          message:
            createFineError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateFine = async (): Promise<void> => {
    validatePromise(finesRef.value!).then(async () => {
      try {
        await updateFineRequest({
          driver_id: finesForm.value.driver_id!,
          vehicle_id: finesForm.value.vehicle_id!,
          local_status: finesForm.value.local_status,
          id: fineDetailsResult.value?.id!,
          document_ids: finesForm.value.document_ids,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Штраф изменен",
          type: "success",
        });
      } catch (e) {
        console.log("", updateFineError.value);

        ElNotification({
          title: updateFineError.value?.title ?? "Ошибка",
          message:
            updateFineError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const updateFineAccrual = async (): Promise<void> => {
    try {
      await updateAccrualFineRequest({
        id: fineDetailsResult.value?.id!,
      });
      hideDrawer();
      ElNotification({
        title: "Успешный запрос",
        message: "Штраф начислен",
        type: "success",
      });
    } catch (e) {
      console.log("", accrualFineError.value);

      ElNotification({
        title: accrualFineError.value?.title ?? "Ошибка",
        message:
          accrualFineError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const downloadFines = async (
    counterparty_id: number,
    requisite_id: number,
    fines_ids: number[],
  ): Promise<void> => {
    try {
      const params = new URLSearchParams();
      params.append("counterparty_id", String(counterparty_id));
      params.append("requisite_id", String(requisite_id));
      fines_ids.forEach((id) => {
        params.append("fines_ids", String(id));
      });

      const result = await axios.get(
        `${MAIN_ENDPOINT}api/v1/fines/${counterparty_id}/generate_payment_document`,
        {
          params,
          responseType: "blob",
        },
      );

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `fine_payment_document_1c_${dayjs().format("YYYY-MM-DD")}.txt`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Платежное поручение получено",
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

  const getFineStatus = (status: t.TFineLocalStatus) => {
    switch (status) {
      case "canceled":
        return "Отменен";
      case "paid":
        return "Погашен";
      case "not_paid":
        return "Требуется оплата";
      default:
        return "";
    }
  };
  const getFineLocalStatus = (status: t.TFineLocalStatus) => {
    switch (status) {
      case "canceled":
        return "Отменен";
      case "paid":
        return "Оплачен";
      case "paid_with_discount":
        return "Оплачен со скидкой";
      case "not_paid":
        return "Требуется оплата";
      case "not_paid_with_discount":
        return "Требуется оплата со скидкой";
      case "not_accrued":
        return "Не начислен";
      default:
        return "";
    }
  };

  const finesLocalStatuses: { key: t.TFineLocalStatus; label: string }[] = [
    { key: "canceled", label: getFineLocalStatus("canceled") },
    { key: "paid", label: getFineLocalStatus("paid") },
    {
      key: "paid_with_discount",
      label: getFineLocalStatus("paid_with_discount"),
    },
    { key: "not_paid", label: getFineLocalStatus("not_paid") },
    {
      key: "not_paid_with_discount",
      label: getFineLocalStatus("not_paid_with_discount"),
    },
  ];
  const finesStatuses: { key: t.TFineLocalStatus; label: string }[] = [
    { key: "canceled", label: getFineStatus("canceled") },
    { key: "paid", label: getFineStatus("paid") },
    { key: "not_paid", label: getFineStatus("not_paid") },
  ];

  return {
    initialFinesParams,
    finesListTotalItems,
    finesList,
    finesListLoading,
    fetchFinesList,

    fineDetailsLoading,
    fineDetailsResult,
    fetchFineDetails,

    createFineLoading,
    createFineError,
    newFine,
    createFine,

    updateFineResponse,
    updateFineLoading,
    updateFineError,
    updateFine,

    finesRef,
    finesRules,
    finesUpdateRules,
    finesForm,
    clear,

    getFineStatus,
    finesStatuses,
    finesLocalStatuses,
    getFineLocalStatus,

    downloadFines,
    updateFineAccrual,

    finesFileList,
    uploadFinesFileList,
    handleRemoveFinesFile,
  };
};

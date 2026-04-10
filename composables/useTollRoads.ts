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
import { type IUploadedServerFile, useFiles } from "@/composables/useFiles";

import useApi from "@/composables/useApi";
import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";
import { MAIN_ENDPOINT } from "@/api";
import axios from "axios";

import {
  formatDateToServer,
  formatDateTimeToServer,
} from "@/helpers/format.helpers";

import * as t from "@/types/tollRoads";
import type { IPagination } from "@/types/apiDefault";

const { downloadFile } = useFiles();

export const useTollRoads = () => {
  const {
    loading: tollRoadsListLoading,
    response: tollRoadsResponse,
    request: fetchTollRoadsList,
  } = useApi<IPagination<t.ITollRoad>, t.ITollRoadListParams>({
    url: "/api/v1/toll_roads",
    method: "GET",
  });
  const {
    loading: tollRoadDetailsLoading,
    response: tollRoadDetailsResult,
    request: fetchTollRoadDetails,
  } = useApi<t.ITollRoad, t.ITollRoadDetailsParams>({
    dynamicUrl: (p) => `/api/v1/toll_roads/${p.toll_road_id}`,
    method: "GET",
  });
  const {
    loading: createTollRoadLoading,
    error: createTollRoadError,
    response: newTollRoad,
    request: createTollRoadRequest,
  } = useApi<t.ITollRoad, t.ITollRoadForm>({
    url: "/api/v1/toll_roads",
    method: "POST",
  });
  const {
    response: updateAccrualTollRoadResponse,
    loading: updateAccrualTollRoadLoading,
    request: updateAccrualsTollRoadRequest,
    error: updateAccrualTollRoadError,
  } = useApi<{ id: string }>({
    method: "POST",
    dynamicUrl: (p) => `/api/v1/toll_roads/${p.id}/accrual`,
  });
  const {
    response: updateTollRoadResponse,
    loading: updateTollRoadLoading,
    request: updateTollRoadRequest,
    error: updateTollRoadError,
  } = useApi<t.ITollRoad, t.ITollRoadEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/toll_roads/${p.id}`,
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const { uploadFileList } = useFiles();

  const initialTollRoadsParams: t.ITollRoadListParams = {
    no_driver: false,
    detail: true,
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

  const emptyTollRoadsForm: t.ITollRoadForm = {
    local_status: "",
    status: undefined,
    issued_date: "",
    vehicle_id: undefined,
    driver_id: undefined,
    price: "",
    number: undefined,
    comment: "",
    document_ids: [],
  };

  const tollRoadsRef = ref<FormInstance>();
  const tollRoadRules = reactive<FormRules>({
    number: [
      {
        required: true,
        message: "Введите номер штрафа",
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
    issued_date: [
      {
        required: true,
        message: "Введите Дата проезда",
        trigger: "change",
      },
    ],
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    driver_id: [
      {
        required: true,
        message: "Выберите водителя",
        trigger: "change",
      },
    ],
    price: [
      { required: true, message: "Введите cуммy штрафа", trigger: "blur" },
    ],
  });
  const tollRoadsForm = ref({
    ...emptyTollRoadsForm,
  });

  const tollRoadsList = computed<t.ITollRoad[]>(() => {
    return tollRoadsResponse.value?.items ?? [];
  });
  const tollRoadsListTotalItems = computed(
    () => tollRoadsResponse.value?.total_items ?? 0
  );

  watch(tollRoadDetailsResult, (v) => {
    if (v) {
      clear();
      const keys = Object.keys(v) as (keyof t.ITollRoad)[];
      keys.forEach((key) => {
        if (key in tollRoadsForm.value) {
          // @ts-ignore
          tollRoadsForm.value[key] = v[key];
        }
      });
    }
  });

  const tollRoadFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const pendingFiles = ref<UploadUserFile[]>([]);
  let uploadTimeout: any = null;

  const uploadTollRoadFileList = (
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
        "TOLL_ROAD_PHOTO",
      );

      if (uploaded?.length) {
        tollRoadsForm.value.document_ids = [
          ...tollRoadsForm.value.document_ids,
          ...uploaded.map((f) => f.id),
        ];

        tollRoadFileList.value = [
          ...tollRoadFileList.value.filter((f) => (f as any).id),
          ...uploaded,
        ];
      }

      // Очищаем буфер
      pendingFiles.value = [];
    }, 300);
  };

  const handleRemoveTollRoadFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      tollRoadsForm.value.document_ids =
        tollRoadsForm.value.document_ids.filter((f) => f !== id);
  };

  const createTollRoad = async (): Promise<void> => {
    validatePromise(tollRoadsRef.value!).then(async () => {
      try {
        await createTollRoadRequest({
          ...tollRoadsForm.value,
          issued_date: formatDateTimeToServer(tollRoadsForm.value.issued_date),
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Платная дорога добавлена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createTollRoadError.value?.title ?? "Ошибка",
          message:
            createTollRoadError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateTollRoad = async (): Promise<void> => {
    validatePromise(tollRoadsRef.value!).then(async () => {
      try {
        await updateTollRoadRequest({
          driver_id: tollRoadsForm.value.driver_id!,
          vehicle_id: tollRoadsForm.value.vehicle_id!,
          local_status: tollRoadsForm.value.local_status,
          id: tollRoadDetailsResult.value?.id!,
          comment: tollRoadsForm.value?.comment,
          document_ids: tollRoadsForm.value.document_ids,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Платная дорога изменена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateTollRoadError.value?.title ?? "Ошибка",
          message:
            updateTollRoadError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const updateTollRoadAccrual = async (): Promise<void> => {
    try {
      await updateAccrualsTollRoadRequest({
        id: tollRoadDetailsResult.value?.id!,
      });
      hideDrawer();
      ElNotification({
        title: "Успешный запрос",
        message: "Платная дорога начислена водителю",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: updateAccrualTollRoadError.value?.title ?? "Ошибка",
        message:
          updateAccrualTollRoadError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const downloadTollRoads = async (
    counterparty_id: number,
    requisite_id: number,
    toll_roads_ids: number[]
  ): Promise<void> => {
    try {
      const params = new URLSearchParams();
      params.append("counterparty_id", String(counterparty_id));
      params.append("requisite_id", String(requisite_id));
      toll_roads_ids.forEach((id) => {
        params.append("toll_roads_ids", String(id));
      });

      const result = await axios.get(
        `${MAIN_ENDPOINT}api/v1/toll_roads/${counterparty_id}/generate_payment_document`,
        {
          params,
          responseType: "blob",
        }
      );

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `toll_road_payment_document_1c_${dayjs().format("YYYY-MM-DD")}.txt`,
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

  const clear = () => {
    tollRoadsForm.value = { ...emptyTollRoadsForm };
    tollRoadFileList.value = [];
  };
  const getTollRoadStatus = (status: t.TTollRoadStatus) => {
    switch (status) {
      case "expired":
        return "Истек";
      case "paid":
        return "Погашен";
      case "not_paid":
        return "Требуется оплата";
      default:
        return "";
    }
  };
  const getTollRoadLocalStatus = (status: t.TTollRoadLocalStatus) => {
    switch (status) {
      case "canceled":
        return "Отменен";
      case "paid":
        return "Погашен";
      case "not_paid":
        return "Требуется оплата";
      case "not_accrued":
        return "Не начислен";
      default:
        return "";
    }
  };

  return {
    initialTollRoadsParams,
    tollRoadsRef,
    tollRoadRules,
    tollRoadsForm,

    tollRoadsList,
    tollRoadsListTotalItems,
    tollRoadsListLoading,
    fetchTollRoadsList,

    tollRoadDetailsLoading,
    tollRoadDetailsResult,
    fetchTollRoadDetails,

    createTollRoadLoading,
    createTollRoadError,
    newTollRoad,
    createTollRoad,

    updateTollRoadResponse,
    updateTollRoadLoading,
    updateTollRoadError,
    updateTollRoad,

    clear,
    getTollRoadStatus,
    getTollRoadLocalStatus,
    updateTollRoadAccrual,

    tollRoadFileList,
    uploadTollRoadFileList,
    handleRemoveTollRoadFile,

    downloadTollRoads
  };
};

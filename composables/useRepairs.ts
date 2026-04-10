import type { IPagination } from "@/types/apiDefault";
import type * as t from "@/types/repairs";
import useApi from "./useApi";
import { computed, reactive, ref, watch } from "vue";
import {
  type FormInstance,
  type FormRules,
  type UploadUserFile,
  type UploadProps,
  type UploadFiles,
  type UploadFile,
  ElNotification,
  dayjs,
} from "element-plus";
import { ElMessage } from "element-plus";
import { useHelpers } from "./useHelpers";
import { useRoute } from "vue-router";
import { EDrawerRouteHash } from "./useApp";
import { type IUploadedServerFile, useFiles } from "@/composables/useFiles";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

export const useRepairs = () => {
  const {
    request: fetchList,
    response,
    loading: listLoading,
    error: listError,
  } = useApi<IPagination<t.IRepair>, t.IRepairPaginatedParams>({
    url: "/api/v1/repairs/paginated",
    method: "GET",
  });

  const {
    request: detailRequest,
    response: detailResult,
    loading: detailLoading,
    error: detailError,
  } = useApi<t.IRepair, t.IRepairDetailParams>({
    dynamicUrl: (p) => `/api/v1/repairs/${p.repair_id}`,
    method: "GET",
  });

  /* /api/v1/repairs/report */

  const {
    request: updateRequest,
    response: updateResult,
    loading: updateLoading,
    error: updateError,
  } = useApi<t.IRepair, Partial<t.IRepairForm>>({
    dynamicUrl: (p) => `/api/v1/repairs/${p.id}`,
    method: "PUT",
  });

  const {
    request: fetchRepairFileById,
    response: uploadedRepairFile,
    loading: uploadedRepairFileLoading,
  } = useApi<
    Blob,
    {
      repair_id: string | number;
      file_id: string | number;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/documents/repairs/${p.repair_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });

  const { uploadFileList } = useFiles();

  const list = computed(() => response.value?.items ?? []);
  const listTotalItems = computed(() => response.value?.total_items ?? 0);
  const repairFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const {
    request: createRepairRequest,
    response: createRepairResponse,
    loading: createRepairLoading,
    error: createRepairError,
  } = useApi<t.IRepair, Partial<t.IRepairForm>>({
    url: "/api/v1/repairs",
    method: "POST",
  });

  const { validatePromise } = useHelpers();

  const form = ref<Partial<t.IRepairForm>>({});

  const mainFormRef = ref<FormInstance>();
  const mainFormRules = reactive<FormRules<t.IRepairForm>>({
    vehicle_id: [
      {
        required: true,
        message: "Выберите автомобиль",
        trigger: "change",
      },
    ],
    method: [
      {
        required: true,
        message: "Выберите Способ ремонта",
        trigger: "change",
      },
    ],
    type: [
      {
        required: true,
        message: "Выберите Вид ремонта",
        trigger: "change",
      },
    ],
  });

  const itemsFormRef = ref<FormInstance>();
  const itemsFormRules = reactive<FormRules<t.IRepairForm>>({
    // stock_id: [
    //   {
    //     required: true,
    //     message: "Выберите cклад",
    //     trigger: "change",
    //   },
    // ],
  });

  const servicesFormRef = ref<FormInstance>();
  const servicesFormRules = reactive<FormRules<t.IRepairForm>>({
    // stock_id: [
    //   {
    //     required: true,
    //     message: "Выберите cклад",
    //     trigger: "change",
    //   },
    // ],
  });

  const createRepair = async (v: Partial<t.IRepairForm> = form.value) => {
    // validatePromise(formRef.value!).then(async () => {
    //   try {
    //     await createOperationRequest({
    //       ...operationForm.value,
    //       amount: -Number(operationForm.value.amount),
    //       parent_operation_id: operationDetailResult.value?.id,
    //       driver_id: operationForm.value.driver_id!,
    //       user_description: `${operationForm.value.user_description} (УДАЛЕНИЕ)`,
    //     });
    //     hideDrawer();
    //     ElNotification({
    //       title: "Успешный запрос",
    //       message: "Операция удалена",
    //       type: "success",
    //     });
    //   } catch (e) {
    //     ElNotification({
    //       title: createOperationError.value?.title ?? "Ошибка",
    //       message:
    //         createOperationError.value?.message ??
    //         "Произошла ошибка, обратитесь к администратору",
    //       type: "error",
    //     });
    //   }
    // });
    return new Promise((res, rej) => {
      Promise.all([
        validatePromise(mainFormRef.value!),
        validatePromise(itemsFormRef.value!),
        validatePromise(servicesFormRef.value!),
      ])
        .then(async () => {
          createRepairRequest(v).then(res).catch(rej);
        })
        .catch(rej);
    });
  };
  const updateRepair = async (v: Partial<t.IRepairForm> = form.value) => {
    return new Promise((res, rej) => {
      Promise.all([
        validatePromise(mainFormRef.value!),
        validatePromise(itemsFormRef.value!),
        validatePromise(servicesFormRef.value!),
      ])
        .then(async () => {
          updateRequest(v).then(res).catch(rej);
        })
        .catch(rej);
    });
  };

  const { downloadFile } = useFiles();

  const downloadRepairs = async (
    data: t.IRepairPaginatedParams,
  ): Promise<void> => {
    const {
      start_date,
      end_date,
      search,
      vehicle_id,
      repair_methods,
      repair_types,
      repair_statuses,
      order_by,
      direction,
    } = data;
    try {
      const params = new URLSearchParams();

      if (start_date) params.append("start_date", String(start_date));
      if (end_date) params.append("end_date", String(end_date));
      if (search) params.append("search", String(search));
      if (vehicle_id) params.append("vehicle_id", String(vehicle_id));
      if (repair_methods?.length) {
        repair_methods.forEach((method) => {
          params.append("repair_methods", String(method));
        });
      }
      if (repair_types?.length) {
        repair_types.forEach((type) => {
          params.append("repair_types", String(type));
        });
      }
      if (repair_statuses?.length) {
        repair_statuses.forEach((status) => {
          params.append("repair_statuses", String(status));
        });
      }
      if (order_by) params.append("order_by", String(order_by));
      if (direction) params.append("direction", String(direction));

      const result = await axios.get(`${MAIN_ENDPOINT}api/v1/repairs/report`, {
        params,
        responseType: "blob",
      });

      downloadFile({
        // @ts-ignore
        id: "_",
        name: `repairs_list_${dayjs().format("YYYY-MM-DD")}.xlsx`,
        blob: result.data,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Список ремонтов получен",
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

  const getRepairStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Заявка";
      case "PENDING":
        return "Ожидание";
      case "IN_PROGRESS":
        return "В работе";
      case "PARKING":
        return "Стоянка";
      case "DONE":
        return "Выполнен";
      case "CANCELED":
        return "Закрыт";
      default:
        break;
    }
  };

  const getRepairStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "#F56C6C";
      case "PENDING":
        return "#E6A23C";
      case "IN_PROGRESS":
        return "#409EFF";
      case "PARKING":
        return "#5856D6";
      case "DONE":
        return "#67C23A";
      case "CANCELED":
        return "#909399";
      default:
        break;
    }
  };

  const methodOptions = [
    {
      label: "Собственная ремонтная зона",
      key: "OWN_REPAIR_ZONE",
    },
    {
      label: "Ремонт (замена) водителем",
      key: "REPAIR_BY_DRIVER",
    },
    {
      label: "В автосервисе",
      key: "REPAIR_BY_SERVICE",
    },
  ];

  const getRepairMethodLabel = (type: string) => {
    switch (type) {
      case "OWN_REPAIR_ZONE":
        return "Собственная ремонтная зона";
      case "REPAIR_BY_DRIVER":
        return "Ремонт (замена) водителем";
      case "REPAIR_BY_SERVICE":
        return "В автосервисе";
      default:
        break;
    }
  };

  const getRepairTypeLabel = (type: string) => {
    switch (type) {
      case "SCHEDULED":
        return "Плановое ТО";
      case "UNSCHEDULED":
        return "Внеплановое ТО";
      default:
        break;
    }
  };

  const uploadRepairFileList = (file: UploadFile) => {
    const maxSizeMB = 50;
    const fileSize = file.size! / 1024 / 1024;

    if (fileSize > maxSizeMB) {
      ElMessage.error(`Файл "${file.name}" весит более ${maxSizeMB}MB.`);
      repairFileList.value = repairFileList.value.filter(
        (f) => f.uid !== file.uid,
      );
      return;
    }

    uploadFileList([file], "REPAIR_DOCUMENT").then((r) => {
      if (r?.length) {
        form.value.document_ids = [
          ...(form.value.document_ids ?? []),
          ...r.map((f) => f.id),
        ];
        repairFileList.value = [...r, ...repairFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined,
        );
      }
    });
  };
  const handleRemoveFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      form.value.document_ids = form.value?.document_ids?.filter(
        (f) => f !== id,
      );
  };
  const fetchRepairDocument = async (
    repairId: string | number,
    file: t.TRepairDocument,
  ) => {
    try {
      const blob = await fetchRepairFileById({
        repair_id: repairId,
        file_id: file.id,
      });
      return new Promise<IUploadedServerFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ ...file, url: reader.result as string, blob });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw error;
    }
  };

  watch(detailResult, () => {
    if (detailResult.value) {
      // @ts-ignore
      form.value = detailResult.value;
      if (detailResult.value?.documents) {
        repairFileList.value = [...detailResult.value?.documents];
      }
    } else {
      form.value = {};
    }
  });

  return {
    fetchList,
    list,
    listTotalItems,
    listLoading,
    listError,

    form,

    mainFormRef,
    mainFormRules,

    itemsFormRef,
    itemsFormRules,

    servicesFormRef,
    servicesFormRules,

    createRepair,
    createRepairResponse,
    createRepairLoading,
    createRepairError,

    getRepairStatusLabel,
    getRepairStatusColor,
    getRepairMethodLabel,
    getRepairTypeLabel,

    detailRequest,
    detailResult,

    updateRepair,
    updateResult,

    repairFileList,
    uploadRepairFileList,
    handleRemoveFile,
    fetchRepairDocument,

    downloadRepairs
  };
};

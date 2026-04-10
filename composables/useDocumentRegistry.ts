import {
  ElNotification,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
} from "element-plus";
import { computed, ref, reactive } from "vue";

import useApi from "@/composables/useApi";
import { useFiles, type IUploadedServerFile } from "./useFiles";

import * as t from "@/types/documentRegistry";
import type { IPagination } from "@/types/apiDefault";

interface IRegistryFromProp extends t.IDocumentRegistryForm {
  file_uid: undefined | number;
}

export const useDocumentRegistry = () => {
  const {
    loading: documentRegistryListLoading,
    response: documentRegistryResponse,
    request: fetchDocumentRegistryList,
  } = useApi<IPagination<t.IDocumentRegistry>, t.IDocumentRegistryListParams>({
    url: "/api/v1/document_registry",
    method: "GET",
  });
  const {
    loading: fineDetailsLoading,
    response: fineDetailsResult,
    request: fetchFineDetails,
  } = useApi<t.IDocumentRegistry, t.IDocumentRegistryDetailParams>({
    dynamicUrl: (p) => `/api/v1/document_registry/${p.id}`,
    method: "GET",
  });
  const {
    loading: createDocumentRegistryLoading,
    error: createDocumentRegistryError,
    response: newDocumentRegistry,
    request: createDocumentRegistryRequest,
  } = useApi<t.IDocumentRegistry, t.IDocumentRegistryForm>({
    url: "/api/v1/document_registry",
    method: "POST",
  });
  const {
    response: updateDocumentRegistryResponse,
    loading: updateDocumentRegistryLoading,
    request: updateDocumentRegistryRequest,
    error: updateDocumentRegistryError,
  } = useApi<t.IDocumentRegistry, t.IDocumentRegistryEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/document_registry/${p.id}`,
  });
  const {
    response: deleteDocumentRegistryResponse,
    loading: deleteDocumentRegistryLoading,
    request: deleteDocumentRegistryRequest,
    error: deleteDocumentRegistryError,
  } = useApi<string, t.IDocumentRegistryDetailParams>({
    method: "DELETE",
    dynamicUrl: (p) => `/api/v1/document_registry/${p.id}`,
  });

  const {
    loading: documentRegistryFileLoading,
    response: documentRegistryFileResponse,
    request: fetchDocumentRegistryFile,
  } = useApi<Blob, t.IDocumentRegistryFileParams>({
    dynamicUrl: (p) =>
      `/api/v1/documents/document_registry/${p.document_registry_record_id}`,
    method: "GET",
    responseType: "blob",
  });

  const initialDocumentRegistryListParams: t.IDocumentRegistryListParams = {
    record_type: "DRIVER_DOCUMENT",
    search: "",
    driver_id: undefined,
    vehicle_id: undefined,
    limit: 20,
    page: 1,
  };
  const initialDocumentRegistryForm: t.IDocumentRegistryForm = {
    document_id: undefined,
    name: "",
    driver_id: undefined,
    vehicle_id: undefined,
    send_to_driver: false,
    sign_required: false,
  };

  const { uploadFileList } = useFiles();

  const documentRegistryForm = ref<IRegistryFromProp>({
    ...initialDocumentRegistryForm,
    file_uid: undefined,
  });
  const documentRegistryRef = ref<FormInstance>();
  const documentRegistryRules = reactive<FormRules>({
    name: [{ required: true, message: "Введите название", trigger: "blur" }],
    driver_id: [
      {
        required: true,
        message: "Выберите водителя",
        trigger: "change",
      },
    ],
    file_uid: [
      {
        required: true,
        message: "Загрузите документ",
        trigger: "change",
      },
    ],
  });

  const documentRegistryList = computed<t.IDocumentRegistry[]>(() => {
    return documentRegistryResponse.value?.items ?? [];
  });
  const documentRegistryListTotalItems = computed(
    () => documentRegistryResponse.value?.total_items ?? 0
  );

  const uploadDriverDocumentRegistry = (v: UploadUserFile) =>
    uploadFileList([v], "DOCUMENT_REGISTRY_DRIVER_DOCUMENT");
  const uploadVehicleDocumentRegistry = (v: UploadUserFile) =>
    uploadFileList([v], "DOCUMENT_REGISTRY_VEHICLE_DOCUMENT");

  const createDocumentRegistry = async (form: t.IDocumentRegistryForm) => {
    try {
      await createDocumentRegistryRequest(form);
      ElNotification({
        title: "Успешный запрос",
        message: "Документ добавлен",
        type: "success",
      });
      return true;
    } catch (error: any) {
      ElNotification({
        title: createDocumentRegistryError.value?.title ?? "Ошибка",
        message:
          error.data?.user_message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const updateDocumentRegistry = async (
    params: t.IDocumentRegistryEditParams
  ) => {
    try {
      await updateDocumentRegistryRequest(params);
      ElNotification({
        title: "Успешный запрос",
        message: "Документ изменен",
        type: "success",
      });
      return true;
    } catch (error: any) {
      ElNotification({
        title: updateDocumentRegistryError.value?.title ?? "Ошибка",
        message:
          error.data?.user_message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };
  const deleteDocumentRegistry = async (
    formId: t.IDocumentRegistryDetailParams
  ) => {
    try {
      await deleteDocumentRegistryRequest(formId);
      ElNotification({
        title: "Успешный запрос",
        message: "Документ удален",
        type: "success",
      });
      return true;
    } catch (error: any) {
      ElNotification({
        title: deleteDocumentRegistryError.value?.title ?? "Ошибка",
        message:
          error.data?.user_message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const getDocumentStatus = (
    status: t.DocumentRegistryRecordStatusType
  ):
    | {
        name: String;
        type: "success" | "danger" | "info";
      }
    | undefined => {
    switch (status) {
      case "NOT_SIGNED":
        return { name: "Не подписан", type: "danger" };
      case "SIGNED":
        return { name: "Подписан", type: "success" };
      case "SIGNED_AT_OFFICE":
        return { name: "Подписан в офисе", type: "success" };
      case "NOT_VIEWED":
        return { name: "Не ознакомлен", type: "danger" };
      case "VIEWED":
        return { name: "Ознакомлен", type: "success" };
      case "PRINTED":
        return { name: "Распечатан", type: "info" };
      default:
        break;
    }
  };

  return {
    documentRegistryForm,
    documentRegistryRef,
    documentRegistryRules,

    initialDocumentRegistryListParams,
    documentRegistryListLoading,
    documentRegistryList,
    documentRegistryListTotalItems,
    fetchDocumentRegistryList,

    createDocumentRegistryLoading,
    createDocumentRegistry,

    updateDocumentRegistryLoading,
    updateDocumentRegistry,

    deleteDocumentRegistryLoading,
    deleteDocumentRegistry,

    fetchDocumentRegistryFile,
    uploadDriverDocumentRegistry,
    uploadVehicleDocumentRegistry,
    
    getDocumentStatus,
  };
};

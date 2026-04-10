import { computed, ref, watch } from "vue";
import useApi from "./useApi";
import * as t from "@/types/printableForms";
import { useFiles, type IUploadedServerFile } from "./useFiles";
import type { UploadUserFile } from "element-plus";

export const usePrintableForms = () => {
  const list = usePrintableFormsList();
  const detail = usePrintableFormsDetail();
  const values = usePrintableFormsValues();
  const { upload } = usePrintableFormsUpload();

  return {
    list,
    detail,
    values,
    upload,
  };
};

export const usePrintableFormsList = () => {
  const { request, response, loading, error } = useApi<
    t.IPrintableForm[],
    t.IPrintableFormsListParams
  >({
    url: "/api/v1/doc_templates",
    method: "GET",
  });

  watch(response, () => {
    console.log({ response: response.value });
  });

  const data = computed(() => response.value ?? []);
  const fetch = async (params: t.IPrintableFormsListParams) => request(params);

  return { fetch, data, loading, error };
};

export const usePrintableFormsUpload = () => {
  const { uploadFileList } = useFiles();
  const upload = (v: UploadUserFile) => uploadFileList([v], "DOC_TEMPLATE");

  return { upload };
};

export const usePrintableFormsDetail = () => {
  const {
    request,
    response: data,
    loading,
    error,
  } = useApi<t.IPrintableForm, t.IPrintableFormsDetailParams>({
    dynamicUrl: (p) => `/api/v1/doc_templates/${p.template_id}`,
    method: "GET",
  });

  const fetch = async (params: t.IPrintableFormsDetailParams) =>
    request(params);

  return { fetch, data, loading, error };
};

export const usePrintableFormsValues = () => {
  const {
    request,
    response: data,
    loading,
    error,
  } = useApi<
    {
      [key: string]: string;
    },
    t.IPrintableFormsValuesParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/doc_templates/values?company_id=${p.company_id}`,
    method: "POST",
  });

  const fetch = async (params: t.IPrintableFormsValuesParams) =>
    request(params);

  return { fetch, data, loading, error };
};

export const usePrintableFormsFill = () => {
  const { request, response, loading, error } = useApi<
    string,
    t.IPrintableFormsFillParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/doc_templates/${p.template_id}/fill?company_id=${p.company_id}`,
    method: "POST",
    responseType: "blob",
  });

  return { request, response, loading, error };
};

export const usePrintableFormsDownload = () => {
  const { request, response, loading, error } = useApi<
    Blob,
    t.IPrintableFormsDownloadParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/doc_templates/${p.template_id}/download?company_id=${p.company_id}`,
    method: "GET",
    responseType: "blob",
  });

  return { request, response, loading, error };
};

export const usePrintableFormsDelete = () => {
  const { request, response, loading, error } = useApi<
    string,
    t.IPrintableFormsDeleteParams
  >({
    dynamicUrl: (p) =>
      `/api/v1/doc_templates/${p.template_id}?company_id=${p.company_id}`,
    method: "DELETE",
  });

  return { request, response, loading, error };
};

import useApi from "@/composables/useApi";
import axios, { MAIN_ENDPOINT } from "@/api/index";
import * as t from "@/types/files";
import { type UploadUserFile, type UploadProps, ElNotification } from "element-plus";
import _ from "lodash";
import type { IDriverDocuments } from "@/types/drivers";
import { storeToRefs } from "pinia";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

export interface IUploadedServerFile extends UploadUserFile {
  id: number;
  blob?: Blob;
  description?: string;
  type?: t.TFilesType | string;
}

export const useFiles = () => {
  const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
    useCompaniesManagementStore()
  );
  const {
    response: fileDetails,
    loading: fileDetailsLoading,
    request: fetchFileDetails,
    error: fileDetailsError,
  } = useApi<Blob, t.IFileDetailsParams>({
    dynamicUrl: (p) => `/api/v1/documents/${p.document_id}`,
    method: "GET",
    responseType: "blob",
  });
  const {
    response: fileStockOperationsDetails,
    loading: filecDetailsLoading,
    request: fetchStockOperationsFileDetails,
    error: fileStockOperationsDetailsError,
  } = useApi<Blob, {stock_operation_id: number, file_id: number}>({
    dynamicUrl: (p) => `/api/v1/documents/stock_operations/${p.stock_operation_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  //LeasingContracts
  const {
    response: fileLeasingContractsDetails,
    loading: filecLeasingContractsLoading,
    request: fetchLeasingContractsFileDetails,
    error: fileLeasingContractsDetailsError,
  } = useApi<Blob, {leasing_contract_id: number, file_id: number}>({
    dynamicUrl: (p) => `/api/v1/documents/leasing_contracts/${p.leasing_contract_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  //Insurance
  const {
    response: fileInsuranceDetails,
    loading: filecInsuranceLoading,
    request: fetchInsuranceFileDetails,
    error: fileInsuranceDetailsError,
  } = useApi<Blob, {insurance_id: number, file_id: number}>({
    dynamicUrl: (p) => `/api/v1/documents/insurances/${p.insurance_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  //Fines
  const {
    response: fileFinesDetails,
    loading: filecFinesLoading,
    request: fetchFinesFileDetails,
    error: fileFinesDetailsError,
  } = useApi<Blob, {fine_id: number, file_id: number}>({
    dynamicUrl: (p) => `/api/v1/documents/fines/${p.fine_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  // TollRoad
  const {
    response: fileTollRoadDetails,
    loading: filecTollRoadLoading,
    request: fetchTollRoadFileDetails,
    error: fileTollRoadDetailsError,
  } = useApi<Blob, {toll_road_id: number, file_id: number}>({
    dynamicUrl: (p) => `/api/v1/documents/toll_roads/${p.toll_road_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  const {
    response: driverFileDetails,
    loading: driverFileDetailsLoading,
    request: fetchDriverFileDetails,
    error: driverFileDetailsError,
  } = useApi<Blob, t.IFileDetailsDriverParams>({
    dynamicUrl: (p) => `/api/v1/documents/${p.driver_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });
  // const {
  //   loading: newFileLoading,
  //   response: newFile,
  //   error: newFileError,
  //   request: createFile,
  // } = useApi<t.IFile, t.IFileCreateParams>({
  //   dynamicUrl: (p) => `/api/v1/documents/create`,
  //   method: "POST",
  // });

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
          formData.append("company_id", currentCompanyId.value.toString());
          const result = await axios.post<{ data: t.IFile }>(
            `${MAIN_ENDPOINT}api/v1/documents/create`,
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
      ElNotification({
        title: "Ошибка",
        message: "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
      console.log(error);
    }
  };

  const fetchStockOperationsUploadedFileList = async (v: number[], stock: number ) => {
    try {
      return await Promise.all(
        v.map(async (f) => {
          console.log('f', f);
          const blob = await fetchStockOperationsFileDetails({ file_id: f , stock_operation_id: stock, });
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ name: `document-${f}`, url: reader.result as string, blob });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  //Leasing

  const fetchLeasingContractsUploadedFileList = async (v: IDriverDocuments[], stock: number ) => {
    try {
      return await Promise.all(
        v.map(async (f) => {
          console.log('f', f);
          const blob = await fetchLeasingContractsFileDetails({ file_id: f.id , leasing_contract_id: stock, });
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ ...f, url: reader.result as string, blob });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  //insurance

  const fetchInsuranceUploadedFileList = async (v: IDriverDocuments[], stock: number ) => {
    try {
      return await Promise.all(
        v.map(async (f) => {
          console.log('f', f);
          const blob = await fetchInsuranceFileDetails({ file_id: f.id , insurance_id: stock, });
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ ...f, url: reader.result as string, blob });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  //Fines

  const fetchFinesUploadedFileList = async (v: IDriverDocuments[], stock: number ) => {
    try {
      return await Promise.all(
        v.map(async (f) => {
          console.log('f', f);
          const blob = await fetchFinesFileDetails({ file_id: f.id , fine_id: stock, });
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ ...f, url: reader.result as string, blob, });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  //TollRoad
  const fetchTollRoadUploadedFileList = async (v: IDriverDocuments[], stock: number ) => {
    try {
      return await Promise.all(
        v.map(async (f) => {
          console.log('f', f);
          const blob = await fetchTollRoadFileDetails({ file_id: f.id , toll_road_id: stock, });
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ ...f, url: reader.result as string, blob });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  const fetchUploadedFileList = async (v: IDriverDocuments[]) => {
    try {
      // return await Promise.all(
      //   v.map(async (f) => {
      //     const blob = await fetchFileDetails({ document_id: f.id });
      //     return { ...f, url: URL.createObjectURL(blob) };
      //   })
      // );
      return await Promise.all(
        v.map(async (f) => {
          console.log('F', f)
          const blob = await fetchFileDetails({ document_id: f.id });
          // return {
          //   ...f,
          //   url: `https://api.vehicle.xdev.team/api/v1/documents/${f.id}?document_id=${f.id}`,
          // };
          return new Promise<IUploadedServerFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ ...f, url: reader.result as string, blob });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
      );
    } catch (error) {
      throw error;
    }
  };

  const downloadFile = (file: IUploadedServerFile | UploadUserFile) => {
    if (!("blob" in file) || !file.blob) return;

    const url = URL.createObjectURL(file.blob);
    const aElement = document.createElement("a");
    aElement.href = url;
    aElement.download = file.name;
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
    URL.revokeObjectURL(url);
  };

  return {
    fileDetails,
    // newFile,

    fileDetailsLoading,
    // newFileLoading,

    fileDetailsError,
    // newFileError,

    fetchFileDetails,
    fetchDriverFileDetails,
    fetchStockOperationsUploadedFileList,
    fetchFinesUploadedFileList,
    fetchTollRoadUploadedFileList,
    fetchLeasingContractsUploadedFileList,
    fetchInsuranceUploadedFileList,

    // createFile,
    uploadFileList,
    fetchUploadedFileList,
    downloadFile,
  };
};

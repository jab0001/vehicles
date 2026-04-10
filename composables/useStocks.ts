import { computed, ref, reactive, watch } from "vue";

import {
  ElNotification,
  // dayjs,
  type FormInstance,
  type FormRules,
  type UploadFile,
  type UploadFiles,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";

import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";

import useApi from "@/composables/useApi";
import * as t from "@/types/stocks";
import type { IPagination } from "@/types/apiDefault";
import { useFiles, type IUploadedServerFile } from "./useFiles";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";

export const useStocks = () => {
  const {
    loading: stocksListLoading,
    response: stocksResponse,
    request: fetchStocksList,
  } = useApi<IPagination<t.IStock>, t.IStocksListParams>({
    url: "/api/v1/stocks/stocks/paginated",
    method: "GET",
  });
  const {
    loading: stockDetailsLoading,
    response: stockDetailsResult,
    request: fetchStockDetails,
  } = useApi<t.IStock, t.IStockDetailsParams>({
    dynamicUrl: (p) => `/api/v1/stocks/stocks/${p.stock_id}`,
    method: "GET",
  });
  const {
    loading: createStockLoading,
    error: createStockError,
    response: newStock,
    request: createStockRequest,
  } = useApi<t.IStock, t.IStockForm>({
    url: "/api/v1/stocks/stocks",
    method: "POST",
  });
  const {
    response: updateStockResponse,
    loading: updateStockLoading,
    request: updateStockRequest,
    error: updateStockError,
  } = useApi<t.IStock, t.IStockEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/stocks/stocks/${p.id}`,
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const initialStocksParams: t.IStocksListParams = {
    limit: 20,
    page: 1,
    search: "",
  };
  const emptyStocksForm: t.IStockForm = {
    name: "",
  };

  const stocksRef = ref<FormInstance>();
  const stocksRules = reactive<FormRules>({
    name: [
      { required: true, message: "Введите название склада", trigger: "blur" },
    ],
  });
  const stocksForm = ref({
    ...emptyStocksForm,
  });

  const stocksList = computed<t.IStock[]>(() => {
    return stocksResponse.value?.items ?? [];
  });
  const stocksListTotalItems = computed(
    () => stocksResponse.value?.total_items ?? 0
  );

  watch(stockDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IStockForm)[];
      keys.forEach((key) => {
        // @ts-ignore
        stocksForm.value[key] = v[key];
      });
    }
  });

  const createStock = async (): Promise<void> => {
    validatePromise(stocksRef.value!).then(async () => {
      try {
        await createStockRequest({
          ...stocksForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Склад добавлен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createStockError.value?.title ?? "Ошибка",
          message:
            createStockError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateStock = async (): Promise<void> => {
    validatePromise(stocksRef.value!).then(async () => {
      try {
        await updateStockRequest({
          ...stocksForm.value,
          id: stockDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Склад изменен",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateStockError.value?.title ?? "Ошибка",
          message:
            updateStockError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    stocksForm.value = { ...emptyStocksForm };
  };

  return {
    stocksListTotalItems,
    initialStocksParams,
    stocksRef,
    stocksRules,
    stocksForm,
    clear,

    stocksListLoading,
    stocksList,
    fetchStocksList,

    stockDetailsLoading,
    stockDetailsResult,
    fetchStockDetails,

    createStockLoading,
    createStockError,
    newStock,
    createStock,

    updateStockResponse,
    updateStockLoading,
    updateStockError,
    updateStock,
  };
};

// Операции
export const useStocksOperations = () => {
  const { loading, response, request } = useApi<
    IPagination<t.IStockOperation>,
    t.IStockOperationListParams
  >({
    url: "/api/v1/stocks/stock_operations/paginated",
    method: "GET",
  });
  const {
    loading: operationDetailsLoading,
    response: operationDetailsResult,
    request: fetchOperationDetails,
  } = useApi<t.IStockOperation, t.IStockOperationDetailParams>({
    dynamicUrl: (p) =>
      `/api/v1/stocks/stock_operations/${p.stock_operation_id}`,
    method: "GET",
  });

  const {
    loading: operationQtyLoading,
    response: operationQtyResponse,
    request: fetchStockOperationQty,
  } = useApi<t.IStockOperationQuantity, t.IStockOperationQuantityParams>({
    url: "/api/v1/stocks/stock_operations/current_item_quantity",
    method: "GET",
  });

  return {
    loading,
    response,
    request,

    operationQtyLoading,
    operationQtyResponse,
    fetchStockOperationQty,

    operationDetailsLoading,
    operationDetailsResult,
    fetchOperationDetails,
  };
};

// Номенклатура
export const useStocksNomenclature = () => {
  const {
    loading: nomenclatureListLoading,
    response: nomenclatureResponse,
    request: fetchnomenclatureList,
  } = useApi<IPagination<t.INomenclature>, t.INomenclatureListParams>({
    url: "/api/v1/stocks/nomenclature/paginated",
    method: "GET",
  });
  const {
    response: nomenclatureListWithoutPagination,
    request: fetchnomenclatureWithoutPaginationList,
  } = useApi<t.INomenclature[], t.INomenclatureListWithoutPaginationParams>({
    url: "/api/v1/stocks/nomenclature/list_with_item",
    method: "GET",
  });
  const {
    loading: nomenclatureDetailsLoading,
    response: nomenclatureDetailsResult,
    request: fetchNomenclatureDetails,
  } = useApi<t.INomenclature, t.INomenclatureDetailsParams>({
    dynamicUrl: (p) => `/api/v1/stocks/nomenclature/${p.nomenclature_id}`,
    method: "GET",
  });
  const {
    loading: createNomenclatureLoading,
    error: createNomenclatureError,
    response: newNomenclature,
    request: createNomenclatureRequest,
  } = useApi<t.INomenclature, t.INomenclatureForm>({
    dynamicUrl: () => `/api/v1/stocks/nomenclature`,
    method: "POST",
  });
  const {
    response: updateNomenclatureResponse,
    loading: updateNomenclatureLoading,
    request: updateNomenclatureRequest,
    error: updateNomenclatureError,
  } = useApi<t.INomenclature, t.INomenclatureEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/stocks/nomenclature/${p.id}`,
  });
  const {
    loading: nomenclatureGroupsLoading,
    response: nomenclatureGroups,
    request: fetchNomenclatureGroups,
  } = useApi<string[]>({
    url: "/api/v1/stocks/nomenclature/group_names",
    method: "GET",
  });

  const emptyNomenclatureForm: t.INomenclatureForm = {
    name: "",
    type: "",
    measurement_unit: "",
  };
  const initialNomenclatureParams: t.INomenclatureListParams = {
    limit: 20,
    page: 1,
    search: "",
  };
  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const nomenclatureRef = ref<FormInstance>();
  const nomenclatureRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите название номенклатуры",
        trigger: "blur",
      },
    ],
    type: [
      {
        required: true,
        message: "Выберите тип",
        trigger: "change",
      },
    ],
    measurement_unit: [
      {
        required: true,
        message: "Выберите единицу измерения",
        trigger: "change",
      },
    ],
  });
  const nomenclatureForm = ref({
    ...emptyNomenclatureForm,
  });

  const nomenclatureList = computed<t.INomenclature[]>(() => {
    return nomenclatureResponse.value?.items ?? [];
  });
  const nomenclatureListTotalItems = computed(
    () => nomenclatureResponse.value?.total_items ?? 0
  );

  watch(nomenclatureDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.INomenclature)[];
      keys.forEach((key) => {
        // @ts-ignore
        nomenclatureForm.value[key] = v[key];
      });
    }
  });

  const createNomenclature = async (): Promise<void> => {
    validatePromise(nomenclatureRef.value!).then(async () => {
      try {
        await createNomenclatureRequest({
          ...nomenclatureForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Номенклатура создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createNomenclatureError.value?.title ?? "Ошибка",
          message:
            createNomenclatureError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateNomenclature = async (): Promise<void> => {
    validatePromise(nomenclatureRef.value!).then(async () => {
      try {
        await updateNomenclatureRequest({
          name: nomenclatureForm.value.name,
          group_name: nomenclatureForm.value.group_name,
          article: nomenclatureForm.value.article,
          measurement_unit: nomenclatureForm.value.measurement_unit,
          description: nomenclatureForm.value.description,
          id: nomenclatureDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Номенклатура изменена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateNomenclatureError.value?.title ?? "Ошибка",
          message:
            updateNomenclatureError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    nomenclatureForm.value = { ...emptyNomenclatureForm };
  };
  const getNomenclatureTypeName = (type: t.TNomenclatureType) => {
    switch (type) {
      case "ITEM":
        return "Товар";
      case "SERVICE":
        return "Услуга";
      default:
        return "";
    }
  };
  const getNomenclatureMeasurementUnit = (type: t.TMeasurementUnit) => {
    switch (type) {
      case "HOUR":
        return "часы";
      case "KG":
        return "кг";
      case "LITER":
        return "литры";
      case "PIECE":
        return "шт";
      default:
        return "";
    }
  };

  const getNomenclatureVatRate = (type: t.TStocVatRate) => {
    switch (type) {
      case "NO_VAT":
        return "Без НДС";
      case "VAT_20":
        return "20%";
      case "VAT_18":
        return "18%";
      case "VAT_15":
        return "15%";
      case "VAT_10":
        return "10%";
      default:
        return "";
    }
  };
  const getNomenclatureVatRatePercent = (type: t.TStocVatRate) => {
    switch (type) {
      case "NO_VAT":
        return 0;
      case "VAT_20":
        return 20;
      case "VAT_18":
        return 18;
      case "VAT_15":
        return 15;
      case "VAT_10":
        return 10;
      default:
        return 0;
    }
  };

  return {
    nomenclatureListLoading,
    nomenclatureList,
    nomenclatureListTotalItems,
    fetchnomenclatureList,

    nomenclatureListWithoutPagination,
    fetchnomenclatureWithoutPaginationList,

    nomenclatureDetailsLoading,
    nomenclatureDetailsResult,
    fetchNomenclatureDetails,

    createNomenclatureLoading,
    newNomenclature,
    createNomenclature,

    updateNomenclatureResponse,
    updateNomenclatureLoading,
    updateNomenclatureError,
    updateNomenclature,

    nomenclatureGroupsLoading,
    nomenclatureGroups,
    fetchNomenclatureGroups,

    nomenclatureForm,
    nomenclatureRules,
    nomenclatureRef,
    initialNomenclatureParams,
    clear,
    getNomenclatureTypeName,
    getNomenclatureMeasurementUnit,
    getNomenclatureVatRate,
    getNomenclatureVatRatePercent,
  };
};

// Перемещение movement
export const useStocksMoving = () => {
  const {
    loading: createMovingOperationLoading,
    error: createMovingOperationError,
    response: newMovingOperation,
    request: createMovingOperationRequest,
  } = useApi<t.IStockOperation, t.IStocksMovingForm>({
    url: "/api/v1/stocks/stock_operations/movement",
    method: "POST",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise, clearRefEmptyKeys } = useHelpers();
  const {
    loading: movingLoading,
    response: movingResponse,
    request: fetchMovingList,

    operationDetailsLoading: movingDetalsLoading,
    operationDetailsResult: movingDetailsResult,
    fetchOperationDetails: fetchMovingOperationDetails,
  } = useStocksOperations();

  const emptyMovingForm: t.IStocksMovingForm = {
    company_group_id: undefined,
    stock_id: undefined,
    stock_old_id: undefined,
    items: [],
    description: "",
  };
  const initialMovingParams: t.IStockOperationListParams = {
    limit: 20,
    page: 1,
    operation_type: "MOVEMENT",
    datetime_from: undefined,
    datetime_to: undefined,
  };
  const movingRef = ref<FormInstance>();
  const movingRules = reactive<FormRules>({
    company_group_id: [
      {
        required: true,
        message: "Выберите организацию",
        trigger: "change",
      },
    ],
    stock_old_id: [
      {
        required: true,
        message: "Выберите склад откуда",
        trigger: "change",
      },
    ],
    stock_id: [
      {
        required: true,
        message: "Выберите склад куда",
        trigger: "change",
      },
    ],
    items: [
      {
        required: true,
        message: "Выберите товары",
        trigger: "change",
      },
    ],
  });
  const movingForm = ref({
    ...emptyMovingForm,
  });

  const movingList = computed<t.IStockOperation[]>(() => {
    return movingResponse.value?.items ?? [];
  });
  const movingListTotalItems = computed(
    () => movingResponse.value?.total_items ?? 0
  );

  watch(movingDetailsResult, (v) => {
    if (v) {
      movingForm.value = {
        company_group_id: v.company_group_id,
        stock_id: v.stock_id,
        stock_old_id: v.stock_old_id,
        items: [...v.items],
        description: v.description,
      };
    }
  });

  const createMovingOperation = async (): Promise<void> => {
    validatePromise(movingRef.value!).then(async () => {
      try {
        clearRefEmptyKeys(movingForm);
        await createMovingOperationRequest({
          ...movingForm.value,
          company_group_id: movingForm.value.company_group_id,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция перемещения создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createMovingOperationError.value?.title ?? "Ошибка",
          message:
            createMovingOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const clear = () => {
    movingForm.value = { ...emptyMovingForm };
  };

  return {
    movingRef,
    movingRules,
    movingForm,
    initialMovingParams,
    clear,

    movingLoading,
    movingList,
    movingListTotalItems,
    fetchMovingList,

    createMovingOperationLoading,
    createMovingOperationError,
    newMovingOperation,
    createMovingOperation,

    movingDetalsLoading,
    movingDetailsResult,
    fetchMovingOperationDetails,
  };
};

// Поступление arrival
export const useStocksReceipt = () => {
  const {
    loading: createReceiptOperationLoading,
    error: createReceiptOperationError,
    response: newReceiptOperation,
    request: createReceiptOperationRequest,
  } = useApi<t.IStockOperation, t.IStocksArrivalForm>({
    url: "/api/v1/stocks/stock_operations/arrival",
    method: "POST",
  });

  const { hideDrawer } = useAppStore();
  const { userProfile } = storeToRefs(useUserStore());
  const { validatePromise, clearRefEmptyKeys } = useHelpers();
  const {
    loading: receiptLoading,
    response: receiptResponse,
    request: fetchReceiptList,

    operationDetailsLoading: receiptDetalsLoading,
    operationDetailsResult: receiptDetailsResult,
    fetchOperationDetails: fetchReceiptOperationDetails,
  } = useStocksOperations();
  const initialReceiptParams: t.IStockOperationListParams = {
    limit: 20,
    page: 1,
    operation_type: "ARRIVAL",
    datetime_from: undefined,
    datetime_to: undefined,
  };
  const emptyReceiptForm: t.IStocksArrivalForm = {
    company_group_id: undefined,
    stock_id: undefined,
    invoice_number: undefined,
    invoice_date: undefined,
    items: [],
    services: [],
    description: "",
    counterparty_id: undefined,
    price_includes_vat: true,
    distribute_services_price_to_items: false,
    document_ids: [],
  };
  const receiptRef = ref<FormInstance>();
  const receiptRules = reactive<FormRules>({
    /* company_group_id: [
      {
        required: true,
        message: "Выберите организацию",
        trigger: "change",
      },
    ], */
    counterparty_id: [
      {
        required: true,
        message: "Выберите контрагент",
        trigger: "change",
      },
    ],
    stock_id: [
      {
        required: true,
        message: "Выберите склад",
        trigger: "change",
      },
    ],
    items: [
      {
        required: true,
        message: "Выберите товары",
        trigger: "change",
      },
    ],
  });
  const receiptForm = ref({
    ...emptyReceiptForm,
  });

  const receiptList = computed<t.IStockOperation[]>(() => {
    return receiptResponse.value?.items ?? [];
  });

  const { uploadFileList } = useFiles();

  const invoiceFileList = ref<IUploadedServerFile[] | UploadUserFile[]>([]);

  const receiptListTotalItems = computed(
    () => receiptResponse.value?.total_items ?? 0
  );

  const clearInvoiceFilesLists = () => {
    invoiceFileList.value = [];
  };

  watch(receiptDetailsResult, (v) => {
    if (v) {
      receiptForm.value = {
        company_group_id: v.company_group_id,
        stock_id: v.stock_id,
        description: v.description,
        counterparty_id: v.counterparty_id,
        price_includes_vat: v.price_includes_vat,
        invoice_number: v.invoice_number,
        invoice_date: v.invoice_date,
        distribute_services_price_to_items:
          v.distribute_services_price_to_items,
        document_ids: v.document_ids,
        items: [...v.items],
        services: [...v.services],
      };
    }
  });

  const uploadInvoiceFileList = (_: UploadFile, uploadFiles: UploadFiles) => {
    uploadFileList(uploadFiles, "STOCK_OPERATION_DOCUMENT").then((r) => {
      if (r?.length) {
        receiptForm.value.document_ids = [
          ...receiptForm.value.document_ids,
          ...r.map((f) => f.id),
        ];
        invoiceFileList.value = [...r, ...invoiceFileList.value].filter(
          (f) => (f as IUploadedServerFile)?.id !== undefined
        );
      }
    });
  };

  const handleRemoveFile: UploadProps["onRemove"] = (uploadFile) => {
    const id = (uploadFile as IUploadedServerFile)?.id;
    if (id)
      receiptForm.value.document_ids = receiptForm.value.document_ids.filter(
        (f) => f !== id
      );
  };

  const createReceiptOperation = async (): Promise<void> => {
    validatePromise(receiptRef.value!).then(async () => {
      try {
        // clearRefEmptyKeys(receiptForm);
        const { price_includes_vat, ...restForm } = receiptForm.value;

        const formData = {
          ...restForm,
          items: restForm.items.map((item: any) => {
            let price = !price_includes_vat
              ? Number(item.price) + item.vatAmount
              : item.price;
            price = Number((price).toFixed(2))/*  * Number(item.quantity) */;
            return {
              ...item,
              price,
            };
          }),
          services: restForm.services?.map((service: any) => {
            let price = !price_includes_vat
              ? Number(service.price) + service.vatAmount
              : service.price;
            price = Number((price).toFixed(2))/*  * Number(service.quantity) */;
            return {
              ...service,
              price,
            };
          }),
          description: restForm.description || null,
          price_includes_vat,
          company_group_id: userProfile?.value?.company_group_id,
        };

        await createReceiptOperationRequest(formData);
        hideDrawer();
        clearInvoiceFilesLists();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция поступления создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createReceiptOperationError.value?.title ?? "Ошибка",
          message:
            createReceiptOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const clear = () => {
    receiptForm.value = { ...emptyReceiptForm };
  };

  return {
    receiptRef,
    receiptRules,
    receiptForm,
    initialReceiptParams,
    clear,

    invoiceFileList,
    handleRemoveFile,
    uploadInvoiceFileList,
    clearInvoiceFilesLists,

    receiptList,
    receiptListTotalItems,
    receiptLoading,
    fetchReceiptList,

    createReceiptOperationLoading,
    createReceiptOperationError,
    newReceiptOperation,
    createReceiptOperation,

    receiptDetalsLoading,
    receiptDetailsResult,
    fetchReceiptOperationDetails,
  };
};

// Списание expenditure
export const useStocksWriteOff = () => {
  const {
    loading: createWriteOffOperationLoading,
    error: createWriteOffOperationError,
    response: newWriteOffOperation,
    request: createWriteOffOperationRequest,
  } = useApi<t.IStockOperation, t.IStocksExpenditureForm>({
    url: "/api/v1/stocks/stock_operations/expenditure",
    method: "POST",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise, clearRefEmptyKeys } = useHelpers();
  const {
    loading: writeOffLoading,
    response: writeOffResponse,
    request: fetchWriteOffList,

    operationDetailsLoading: writeOfDetalsLoading,
    operationDetailsResult: writeOfDetailsResult,
    fetchOperationDetails: fetchWriteOfOperationDetails,
  } = useStocksOperations();

  const initialWriteOffParams: t.IStockOperationListParams = {
    limit: 20,
    page: 1,
    operation_type: "EXPENDITURE",
    datetime_from: undefined,
    datetime_to: undefined,
  };
  const emptyWriteOffForm: t.IStocksExpenditureForm = {
    company_group_id: undefined,
    stock_id: undefined,
    description: "",
    items: [],
    cost_category_id: undefined,
    cost_description: "",
  };
  const writeOffRef = ref<FormInstance>();
  const writeOffRules = reactive<FormRules>({
    company_group_id: [
      {
        required: true,
        message: "Выберите организацию",
        trigger: "change",
      },
    ],
    stock_id: [
      {
        required: true,
        message: "Выберите склад куда",
        trigger: "change",
      },
    ],
    items: [
      {
        required: true,
        message: "Выберите товары",
        trigger: "change",
      },
    ],
    cost_category_id: [
      {
        required: true,
        message: "Выберите статью затрат",
        trigger: "change",
      },
    ],
  });
  const writeOffForm = ref({
    ...emptyWriteOffForm,
  });

  const writeOffList = computed<t.IStockOperation[]>(() => {
    return writeOffResponse.value?.items ?? [];
  });
  const writeOffListTotalItems = computed(
    () => writeOffResponse.value?.total_items ?? 0
  );

  watch(writeOfDetailsResult, (v) => {
    if (v) {
      writeOffForm.value = {
        company_group_id: v.company_group_id,
        stock_id: v.stock_id,
        description: v.description,
        items: [...v.items],
        cost_category_id: v.cost_category_id,
        cost_description: v.cost_description,
      };
    }
  });

  const createWriteOffOperation = async (): Promise<void> => {
    validatePromise(writeOffRef.value!).then(async () => {
      try {
        clearRefEmptyKeys(writeOffForm);
        await createWriteOffOperationRequest({
          ...writeOffForm.value,
          company_group_id: writeOffForm.value.company_group_id,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция списания создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createWriteOffOperationError.value?.title ?? "Ошибка",
          message:
            createWriteOffOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    writeOffForm.value = { ...emptyWriteOffForm };
  };

  return {
    writeOffRef,
    writeOffRules,
    writeOffForm,
    initialWriteOffParams,
    clear,

    writeOffList,
    writeOffListTotalItems,
    writeOffLoading,
    fetchWriteOffList,

    createWriteOffOperationLoading,
    createWriteOffOperationError,
    newWriteOffOperation,
    createWriteOffOperation,

    writeOfDetalsLoading,
    writeOfDetailsResult,
    fetchWriteOfOperationDetails,
  };
};

// Оприходование recognition
export const useStocksPosting = () => {
  const {
    loading: createPostingOperationLoading,
    error: createPostingOperationError,
    response: newPostingOperation,
    request: createPostingOperationRequest,
  } = useApi<t.IStockOperation, t.IStocksRecognitionForm>({
    url: "/api/v1/stocks/stock_operations/recognition",
    method: "POST",
  });

  const { userProfile } = storeToRefs(useUserStore());
  const { hideDrawer } = useAppStore();
  const { validatePromise, clearRefEmptyKeys } = useHelpers();
  const {
    loading: postingLoading,
    response: postingResponse,
    request: fetchPostingList,

    operationDetailsLoading: postingDetalsLoading,
    operationDetailsResult: postingDetailsResult,
    fetchOperationDetails: fetchPostingOperationDetails,
  } = useStocksOperations();
  const emptyPostingForm: t.IStocksRecognitionForm = {
    company_group_id: undefined,
    stock_id: undefined,
    description: "",
    items: [],
  };
  const initialPostingParams: t.IStockOperationListParams = {
    limit: 20,
    page: 1,
    operation_type: "RECOGNITION",
    datetime_from: undefined,
    datetime_to: undefined,
  };
  const postingRef = ref<FormInstance>();
  const postingRules = reactive<FormRules>({
    /* company_group_id: [
      {
        required: true,
        message: "Выберите организацию",
        trigger: "change",
      },
    ], */
    stock_id: [
      {
        required: true,
        message: "Выберите склад куда",
        trigger: "change",
      },
    ],
    items: [
      {
        required: true,
        message: "Выберите товары",
        trigger: "change",
      },
    ],
  });
  const postingForm = ref({
    ...emptyPostingForm,
  });

  const postingList = computed<t.IStockOperation[]>(() => {
    return postingResponse.value?.items ?? [];
  });
  const postingListTotalItems = computed(
    () => postingResponse.value?.total_items ?? 0
  );

  watch(postingDetailsResult, (v) => {
    if (v) {
      postingForm.value = {
        company_group_id: v.company_group_id,
        stock_id: v.stock_id,
        description: v.description,
        items: [...v.items],
      };
    }
  });

  const createPostingOperation = async (): Promise<void> => {
    validatePromise(postingRef.value!).then(async () => {
      try {
        clearRefEmptyKeys(postingForm);
        await createPostingOperationRequest({
          ...postingForm.value,
          company_group_id: userProfile?.value?.company_group_id,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Операция оприходования создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createPostingOperationError.value?.title ?? "Ошибка",
          message:
            createPostingOperationError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const clear = () => {
    postingForm.value = { ...emptyPostingForm };
  };

  return {
    postingRef,
    postingRules,
    postingForm,
    initialPostingParams,
    clear,

    postingList,
    postingListTotalItems,
    postingLoading,
    fetchPostingList,

    createPostingOperationLoading,
    createPostingOperationError,
    newPostingOperation,
    createPostingOperation,

    postingDetalsLoading,
    postingDetailsResult,
    fetchPostingOperationDetails,
  };
};

// Статьи затрат
export const useStocksCostItems = () => {
  const {
    loading: costItemsListLoading,
    response: costItemsResponse,
    request: fetchCostItemsList,
  } = useApi<IPagination<t.IStockCostItem>, t.IStockCostItemsListParams>({
    url: "/api/v1/stocks/cost_categories/paginated",
    method: "GET",
  });
  const {
    loading: costItemDetailsLoading,
    response: costItemDetailsResult,
    request: fetchCostItemDetails,
  } = useApi<t.IStockCostItem, t.IStockCostItemDetailParams>({
    dynamicUrl: (p) => `/api/v1/stocks/cost_categories/${p.cost_category_id}`,
    method: "GET",
  });
  const {
    loading: createCostItemLoading,
    error: createCostItemError,
    response: newCostItem,
    request: createCostItemRequest,
  } = useApi<t.IStockCostItem, t.IStockCostForm>({
    dynamicUrl: () => `/api/v1/stocks/cost_categories`,
    method: "POST",
  });
  const {
    response: updateCostItemResponse,
    loading: updateCostItemLoading,
    request: updateCostItemRequest,
    error: updateCostItemError,
  } = useApi<t.IStockCostItem, t.IStockCostItemEditParams>({
    method: "PUT",
    dynamicUrl: (p) => `/api/v1/stocks/cost_categories/${p.id}`,
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();

  const emptyCostItemsForm: t.IStockCostForm = {
    name: "",
  };
  const initialCostItemsListParams: t.INomenclatureListParams = {
    limit: 20,
    page: 1,
    search: "",
  };
  const costItemsRef = ref<FormInstance>();
  const costItemsRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование статьи",
        trigger: "blur",
      },
      {
        max: 127,
        message: "Наименование статьи не должно превышать 127 символов",
        trigger: "blur",
      },
    ],
  });
  const costItemsForm = ref({
    ...emptyCostItemsForm,
  });

  const costItemsList = computed<t.IStockCostItem[]>(() => {
    return costItemsResponse.value?.items ?? [];
  });
  const costItemsListTotalItems = computed(
    () => costItemsResponse.value?.total_items ?? 0
  );

  watch(costItemDetailsResult, (v) => {
    if (v) {
      const keys = Object.keys(v) as (keyof t.IStockCostItem)[];
      keys.forEach((key) => {
        // @ts-ignore
        costItemsForm.value[key] = v[key];
      });
    }
  });

  const createCostItem = async (): Promise<void> => {
    validatePromise(costItemsRef.value!).then(async () => {
      try {
        await createCostItemRequest({
          ...costItemsForm.value,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Статья создана",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: createCostItemError.value?.title ?? "Ошибка",
          message:
            createCostItemError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };
  const updateCostItem = async (): Promise<void> => {
    validatePromise(costItemsRef.value!).then(async () => {
      try {
        await updateCostItemRequest({
          name: costItemsForm.value.name,
          id: costItemDetailsResult.value?.id!,
        });
        hideDrawer();
        ElNotification({
          title: "Успешный запрос",
          message: "Статья изменена",
          type: "success",
        });
      } catch (e) {
        ElNotification({
          title: updateCostItemError.value?.title ?? "Ошибка",
          message:
            updateCostItemError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const clear = () => {
    costItemsForm.value = { ...emptyCostItemsForm };
  };

  return {
    costItemsRef,
    costItemsRules,
    costItemsForm,
    initialCostItemsListParams,
    clear,

    costItemsList,
    costItemsListTotalItems,
    costItemsListLoading,
    fetchCostItemsList,

    costItemDetailsLoading,
    costItemDetailsResult,
    fetchCostItemDetails,

    createCostItemLoading,
    createCostItemError,
    newCostItem,
    createCostItem,

    updateCostItemResponse,
    updateCostItemLoading,
    updateCostItemError,
    updateCostItem,
  };
};

// Остатки
export const useStocksBalance = () => {
  const {
    loading: balanceListLoading,
    response: balanceListResponse,
    request: fetchBalanceList,
  } = useApi<IPagination<t.IStockBalanceItem>, t.IStockBalanceListParams>({
    url: "/api/v1/stocks/nomenclature/paginated_with_item",
    method: "GET",
  });

  const selectedStocks = ref<t.IStock[]>([]);

  const initialBalanceListParams: t.IStockCostItemsListParams = {
    limit: 20,
    page: 1,
    search: "",
    nomenclature_type: "ITEM",
  };
  const balanceList = computed<t.IStockBalanceItem[]>(() => {
    return balanceListResponse.value?.items ?? [];
  });
  const balanceListTotalItems = computed(
    () => balanceListResponse.value?.total_items ?? 0
  );

  return {
    initialBalanceListParams,
    balanceList,
    balanceListTotalItems,
    balanceListLoading,
    fetchBalanceList,
    selectedStocks,
    balanceListResponse,
  };
};

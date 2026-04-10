import { computed, ref, watch } from "vue";
import dayjs from "dayjs";

import { useHelpers } from "./useHelpers";
import { useAppStore } from "@/stores/appStore";

import useApi from "@/composables/useApi";
import type { IPagination } from "@/types/apiDefault";
import * as t from "@/types/companiesManagement";
import {
  ElNotification,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
} from "element-plus";
import { formatDateToServer } from "@/helpers/format.helpers";
import { useFiles } from "./useFiles";
import axios from "axios";
import { MAIN_ENDPOINT } from "@/api";

export enum ECompaniesTabKey {
  main = "main",
  contact = "contact",
  attachment = "attachment",
  bank = "bank",
}

export const useCompaniesManagement = () => {
  const {
    loading: companiesManagementListLoading,
    response: companiesManagementResponse,
    request: fetchCompaniesManagementListRequest,
  } = useApi<IPagination<t.ICompany>, t.ICompaniesManagementListParams>({
    url: "/api/v1/companies/my_companies",
    method: "GET",
  });
  const {
    loading: companiesCounterpartyListLoading,
    response: companiesCounterpartyResponse,
    request: fetchCompaniesCounterpartyList,
  } = useApi<IPagination<t.ICounterparty>, t.ICounterpartiesParams>({
    url: "/api/v1/counterparties/counterparties",
    method: "GET",
  });
  const {
    loading: companiesCounterpartyItemLoading,
    response: companiesCounterpartyItemResponse,
    request: fetchCompaniesCounterpartyItem,
  } = useApi<t.ICounterpartyContact, { counterparty_id?: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/counterparty/${p.counterparty_id}`,
    method: "GET",
  });
  const {
    loading: companiesCounterpartyContactListLoading,
    response: companiesCounterpartyContactResponse,
    request: fetchCompaniesCounterpartyContactList,
  } = useApi<t.ICounterpartyContact, { counterparty_id?: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/contacts/${p.counterparty_id}/contact`,
    method: "GET",
  });
  const {
    loading: companiesCounterpartyRequisiteListLoading,
    response: companiesCounterpartyRequisiteResponse,
    request: fetchCompaniesCounterpartyRequisiteList,
  } = useApi<t.ICounterpartyRequisite, { counterparty_id?: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/requisites/${p.counterparty_id}/requisite`,
    method: "GET",
  });

  const {
    loading: companyGroupLoading,
    response: companyGroupName,
    request: fetchcompanyGroupName,
  } = useApi<t.ICompanyGroupName>({
    url: "/api/v1/company_group/",
    method: "GET",
  });

  const {
    loading: companiesCounterpartyDocumentLoading,
    response: companiesCounterpartyDocumentResponse,
    request: fetchCompaniesCounterpartyDocument,
  } = useApi<any, { counterparty_id?: number; file_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/documents/counterparties/${p.counterparty_id}/files/${p.file_id}`,
    method: "GET",
    responseType: "blob",
  });

  //creaate

  const {
    response: newCopany,
    loading: createCounterpartyLoading,
    error: createCounterpartyError,
    request: createCounterpartyRequest,
  } = useApi<t.ICounterpartyCreateForm, t.ICounterpartyCreateForm>({
    url: "/api/v1/counterparties/counterparty",
    method: "POST",
  });

  const {
    loading: createCounterpartyContractLoading,
    error: createCounterpartyContactError,
    request: createCounterpartyContactRequest,
  } = useApi<t.ICounterpartyContact, { counterparty_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/contacts/${p.counterparty_id}/contact`,
    method: "POST",
  });

  const {
    loading: createCounterpartyRequisiteLoading,
    error: createCounterpartyRequisiteError,
    request: createCounterpartyRequisiteRequest,
  } = useApi<t.ICounterpartyRequisite, { counterparty_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/requisites/${p.counterparty_id}/requisite`,
    method: "POST",
  });

  //delete

  const {
    loading: deleteCounterpartyLoading,
    error: deleteCounterpartyError,
    request: deleteCounterpartyRequest,
  } = useApi<t.ICounterparty, { counterparty_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/counterparty/${p.counterparty_id}`,
    method: "DELETE",
  });

  const {
    loading: deleteCounterpartyContactLoading,
    error: deleteCounterpartyContactError,
    request: deleteCounterpartyContactRequest,
  } = useApi<
    t.ICounterpartyContact,
    { counterparty_id: number; contact_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/contacts/${p.counterparty_id}/contact/${p.contact_id}`,
    method: "DELETE",
  });

  const {
    loading: deleteCounterpartyRequisiteLoading,
    error: deleteCounterpartyRequisiteError,
    request: deleteCounterpartyRequisiteRequest,
  } = useApi<
    t.ICounterpartyRequisite,
    { counterparty_id: number; requisite_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/requisites/${p.counterparty_id}/requisite/${p.requisite_id}`,
    method: "DELETE",
  });

  //update

  const {
    response: updatedCompany,
    loading: updateCounterpartyLoading,
    error: updateCounterpartyError,
    request: updateCounterpartyRequest,
  } = useApi<t.ICounterpartyCreateForm, { counterparty_id: number }>({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/counterparty/${p.counterparty_id}`,
    method: "PUT",
  });

  const {
    loading: updateCounterpartyContactLoading,
    error: updateCounterpartyContactError,
    request: updateCounterpartyContactRequest,
  } = useApi<
    t.ICounterpartyContact,
    { counterparty_id: number; contact_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/contacts/${p.counterparty_id}/contact/${p.contact_id}`,
    method: "PUT",
  });

  const {
    loading: updateCounterpartyRequisiteLoading,
    error: updateCounterpartyRequisiteError,
    request: updateCounterpartyRequisiteRequest,
  } = useApi<
    t.ICounterpartyRequisite,
    { counterparty_id: number; requisite_id: number }
  >({
    dynamicUrl: (p) =>
      `/api/v1/counterparties/requisites/${p.counterparty_id}/requisite/${p.requisite_id}`,
    method: "PUT",
  });

  const { hideDrawer } = useAppStore();
  const { validatePromise } = useHelpers();
  const companiesManagementLoading = ref(false);

  const fetchCompaniesManagementList = async (
    params: t.ICompaniesManagementListParams
  ) => {
    try {
      companiesManagementLoading.value = true;
      await fetchCompaniesManagementListRequest(params);
      await fetchCompaniesCounterpartyList(params);
      await fetchcompanyGroupName();
    } catch (error) {
      console.log(error);
    } finally {
      companiesManagementLoading.value = false;
    }
  };

  const companiesManagementList = computed<t.ICompany[]>(() => {
    return companiesManagementResponse.value?.items ?? [];
  });

  const initialCounterpartiesParams: t.ICounterpartiesParams = {
    detail: true,
    name: undefined,
    inn: undefined,
    ogrn: undefined,
    limit: 20,
    page: 1,
  };
  const counterpartiesParams = ref<t.ICounterpartiesParams>({
    ...initialCounterpartiesParams,
  });

  /* create Counterparty start */
  const counterpartyRef = ref<FormInstance>();
  const counterpartyFormDefault: t.ICounterpartyCreateForm = {
    id: undefined,
    companies_group_id: undefined,
    counterparty_type: "natural_person",
    category: undefined,

    // # Юр. лицо и физ. лицо
    inn: undefined,
    // # Физ. лицо
    lastname: undefined,
    firstname: undefined,
    middlename: undefined,
    snils: undefined,
    // # document_type = passport
    passport_series: undefined,
    passport_number: undefined,
    passport_issued_by: undefined,
    passport_departament_code: undefined,
    passport_issued_date: undefined,

    // # document_type = not passport
    document_series: undefined,
    document_number: undefined,
    // # Юр. лицо
    organization_form: undefined,
    organization_name: undefined,
    tax_number: undefined,
    registration_number: undefined,
    kpp: undefined,
    ogrn: undefined,
    okpo: undefined,
    document_type: undefined,
    registration_country: undefined,
    registration_date: undefined,

    comment: "",

    // # Контакты
    contacts: [],

    //  # Вложения
    documents: [],

    // # Реквизиты
    requisites: [],

    documents_ids: [],
  };

  const counterpartyForm = ref<t.ICounterpartyCreateForm>({
    ...counterpartyFormDefault,
  });

  const clearForm = () => {
    counterpartyForm.value = { ...counterpartyFormDefault };
    counterpartyForm.value.contacts = [];
    counterpartyForm.value.documents = [];
    counterpartyForm.value.requisites = [];
  };

  /* watch(
    () => counterpartyForm.value.counterparty_type,
    (v) => {
      clearForm();
      counterpartyForm.value.counterparty_type = v;
    },
    { immediate: true }
  ); */
  const counterpartyRules = computed<FormRules>(() => {
    let rules: FormRules = {
      category: [
        {
          required: true,
          message: "Категория контрагента обязательна",
          trigger: "blur",
        },
      ],
    };

    if (counterpartyForm.value.counterparty_type === "natural_person") {
      rules = {
        ...rules,
        ...{
          lastname: [
            { required: true, message: "Фамилия обязательна", trigger: "blur" },
          ],
        },
      };
    } else {
      rules = {
        ...rules,
        ...{
          organization_form: [
            {
              required: true,
              message: "Форма организации обязательна",
              trigger: "blur",
            },
          ],
          organization_name: [
            {
              required: true,
              message: "Название организации обязательно",
              trigger: "blur",
            },
          ],
        },
      };
    }

    return rules;
  });
  // const counterpartyRules = ref<FormRules>({
  //   category: [
  //     {
  //       required: true,
  //       message: "Категория контрагента обязательна",
  //       trigger: "blur",
  //     },
  //   ],
  //   lastname: [
  //     { required: true, message: "Фамилия обязательна", trigger: "blur" },
  //   ],
  //   organization_form: [
  //     {
  //       required: true,
  //       message: "Форма организации обязательна",
  //       trigger: "blur",
  //     },
  //   ],
  //   organization_name: [
  //     {
  //       required: true,
  //       message: "Название организации обязательно",
  //       trigger: "blur",
  //     },
  //   ],
  //   passport_departament_code: [
  //     // { required: true, message: "Введите код подразделения", trigger: "blur" },
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         const isValidFormat = /^\d{3}-\d{3}$/.test(value);
  //         if (!isValidFormat) {
  //           callback(
  //             new Error(
  //               'Код подразделения должен иметь следующий формат "123-456"'
  //             )
  //           );
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["blur"],
  //     },
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         if (!/^[0-9-]*$/.test(value)) {
  //           callback(
  //             new Error(
  //               "Для кода подразделения допустимы только цифры (0-9) и (-)"
  //             )
  //           );
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["change", "input"],
  //     },
  //     {
  //       max: 7,
  //       message:
  //         'Код подразделения должен состоять из 7 символов в формате "123-456"',
  //       trigger: ["blur", "change"],
  //     },
  //     {
  //       min: 7,
  //       message:
  //         'Код подразделения должен состоять из 7 символов в формате "123-456"',
  //       trigger: ["blur"],
  //     },
  //   ],
  //   snils: [
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         if (!/^[0-9-\s]*$/.test(value)) {
  //           callback(
  //             new Error("Для ввода СНИЛС допустимы только цифры (0-9) и (-)")
  //           );
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["change", "input"],
  //     },
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         const isValidFormat = /^\d{3}-\d{3}-\d{3} \d{2}$/.test(value);
  //         if (!isValidFormat) {
  //           callback(
  //             new Error(
  //               'СНИЛС должен быть внесен в следующем формате "123-456-789 12'
  //             )
  //           );
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["blur", "change"],
  //     },
  //   ],
  //   inn: [
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         if (!/^[0-9]*$/.test(value)) {
  //           callback(new Error("Для ввода ИНН/ИИН допустимы только цифры"));
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["change", "input"],
  //     },
  //     {
  //       validator: (rule, value, callback) => {
  //         if (!value || value.trim() == "") {
  //           callback();
  //           return;
  //         }
  //         if (value.length !== 10 && value.length !== 12) {
  //           callback(new Error("ИНН/ИИН должен состоять из 10 либо 12 цифр"));
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: ["blur"],
  //     },
  //   ],
  // });

  /* create Counterparty Contact  */

  const counterpartyContactRef = ref<FormInstance>();
  const counterpartyContactFormDefault: t.ICounterpartyContact = {
    id: undefined,
    contact_type: "address",
    contact_value: "",
    comment: "",
  };

  const counterpartyContactForm = ref<t.ICounterpartyContact>({
    ...counterpartyContactFormDefault,
  });

  const clearContactForm = () => {
    counterpartyContactForm.value = { ...counterpartyContactFormDefault };
  };

  const counterpartyContactRules = ref<FormRules>({
    contact_value: [
      { required: true, message: "Номер телефона обязателен", trigger: "blur" },
    ],
  });

  watch(
    () => counterpartyContactForm.value.contact_type,
    (v) => {
      counterpartyContactRef.value?.clearValidate("contact_value");

      if (v === "mail") {
        counterpartyContactRules.value.contact_value = [
          {
            required: true,
            message: "Электронная почта обязательна",
            trigger: "blur",
          },
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
        ];
      } else {
        const messages: Record<string, string> = {
          phone: "Номер телефона обязателен",
          messenger: "Контакт обязателен",
          address: "Адрес обязателен",
        };
        counterpartyContactRules.value.contact_value = [
          {
            required: true,
            message: messages[v!] || "Поле обязательно",
            trigger: "blur",
          },
        ];
      }
    },
    { immediate: true }
  );

  /* create Counterparty Contact end  */

  /* create Counterparty Requisite */

  const counterpartyRequisiteRef = ref<FormInstance>();
  const counterpartyRequisiteFormDefault: t.ICounterpartyRequisite = {
    id: undefined,
    main_account: false,
    bik: "",
    bank_name: "",
    bank_address: "",
    bank_phone: "",
    correspondent_account: "",
    current_account: "",
    currency: "rub",
    account_assignment: "disbursements",
  };

  const counterpartyRequisiteForm = ref<t.ICounterpartyRequisite>({
    ...counterpartyRequisiteFormDefault,
  });

  const clearRequisiteForm = () => {
    counterpartyRequisiteForm.value = { ...counterpartyRequisiteFormDefault };
  };

  const counterpartyRequisiteRules = {
    bik: [{ required: true, message: "БИК обязателен", trigger: "blur" }],
    bank_name: [
      {
        required: true,
        message: "Наименование банка обязательно",
        trigger: "blur",
      },
    ],
    bank_address: [
      { required: true, message: "Адрес банка обязателен", trigger: "blur" },
    ],
    correspondent_account: [
      {
        required: true,
        message: "Корреспондентский счет обязателен",
        trigger: "blur",
      },
    ],
    current_account: [
      { required: true, message: "Расчетный обязателен", trigger: "blur" },
    ],
    bank_phone: [
      /* {
       validator: (rule: any, value: any, callback: any) => {
         if (value === "" || value.replace(/\D/g, "").length !== 11) {
           return callback(new Error("Введите верный номер"));
         }
         return callback();
       },
     }, */ {
        required: false,
      },
    ],
  };

  /* create Counterparty Requisite end  */

  const companiesCounterpartyList = computed<t.ICounterparty[]>(() => {
    return companiesCounterpartyResponse.value?.items ?? [];
  });

  const companiesCounterpartyListTotalItems = computed(
    () => companiesCounterpartyResponse.value?.total_items ?? 0
  );

  const getCompanyName = (id: number) => {
    return companiesManagementList.value?.find((c) => c.id === id)?.name ?? "";
  };

  const currentCompaniesIdsList = computed<number[]>(() => {
    return companiesManagementList.value.map((c) => c.id) || ([] as number[]);
  });
  const currentCompanyId = ref<number>(0);

  watch(
    companiesManagementList,
    (v) => {
      if (v.length) {
        currentCompanyId.value = v[0].id;
      }
    },
    {
      immediate: true,
    }
  );

  watch(
    companiesCounterpartyItemResponse,
    (v) => {
      if (v) {
        const cleanedResponse = { ...companiesCounterpartyItemResponse.value } as t.ICounterpartyCreateForm;
        delete cleanedResponse?.active;
        counterpartyForm.value = {
          ...counterpartyFormDefault,
          ...cleanedResponse,
          documents_ids: cleanedResponse?.documents.map((items: any) => {
            return items.id;
          }),
        };

      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  // CREATE

  const createCounterparty = async (): Promise<void> => {
    validatePromise(counterpartyRef.value!).then(async () => {
      try {
        const counterpartyCreate = await createCounterpartyRequest({
          ...counterpartyForm.value,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "контрагент добавлен",
          type: "success",
        });

        const id = counterpartyCreate.id!;

        if (counterpartyForm.value.contacts.length) {
          createCounterpartyContacts(id);
        }

        if (counterpartyForm.value.requisites.length) {
          createCounterpartyRequisites(id);
        }
        hideDrawer();
      } catch (e: any) {
        console.log("eeweq", e);
        if (e && e.data && e.data.user_message) {
          ElNotification({
            title: createCounterpartyError.value?.title ?? "Ошибка",
            message:
              e.data.user_message ??
              "Произошла ошибка, обратитесь к администратору",
            type: "error",
          });
        } else {
          ElNotification({
            title: createCounterpartyError.value?.title ?? "Ошибка",
            message:
              createCounterpartyError.value?.message ??
              "Произошла ошибка, обратитесь к администратору",
            type: "error",
          });
        }
      }
    });
  };

  const createCounterpartyContact = async (
    id: number,
    contact: t.ICounterpartyContact
  ): Promise<void> => {
    try {
      await createCounterpartyContactRequest({
        counterparty_id: id,
        ...contact,
      });

      await fetchCompaniesCounterpartyContactList({
        counterparty_id: id,
      });

      if (companiesCounterpartyContactResponse.value) {
        counterpartyForm.value.contacts =
          companiesCounterpartyContactResponse.value.items;
      }

      ElNotification({
        title: "Успешно",
        message: "Контакт были успешно созданы",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createCounterpartyContactError.value?.title ?? "Ошибка",
        message:
          createCounterpartyContactError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const createCounterpartyRequisite = async (
    id: number,
    requisite: t.ICounterpartyRequisite
  ): Promise<void> => {
    try {
      await createCounterpartyRequisiteRequest({
        counterparty_id: id,
        ...requisite,
      });

      await fetchCompaniesCounterpartyRequisiteList({
        counterparty_id: id,
      });

      if (companiesCounterpartyRequisiteResponse.value) {
        counterpartyForm.value.requisites =
          companiesCounterpartyRequisiteResponse.value.items;
      }

      ElNotification({
        title: "Успешно",
        message: "Реквизит были успешно созданы",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createCounterpartyRequisiteError.value?.title ?? "Ошибка",
        message:
          createCounterpartyRequisiteError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const createCounterpartyContacts = async (id: number): Promise<void> => {
    try {
      const contacts = counterpartyForm.value.contacts;

      const promises = contacts.map((contact) =>
        createCounterpartyContactRequest({
          counterparty_id: id,
          ...contact,
        })
      );

      await Promise.all(promises);

      ElNotification({
        title: "Успешно",
        message: "Все контакты были успешно созданы",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createCounterpartyError.value?.title ?? "Ошибка",
        message:
          createCounterpartyError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const createCounterpartyRequisites = async (id: number): Promise<void> => {
    try {
      const requisites = counterpartyForm.value.requisites;

      const promises = requisites.map((requisite) =>
        createCounterpartyRequisiteRequest({
          counterparty_id: id,
          ...requisite,
        })
      );

      await Promise.all(promises);

      ElNotification({
        title: "Успешно",
        message: "Все реквизиты были успешно созданы",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createCounterpartyError.value?.title ?? "Ошибка",
        message:
          createCounterpartyError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  // UPDATE

  const updateCounterparty = async (id: number): Promise<void> => {
    validatePromise(counterpartyRef.value!).then(async () => {
      try {
        await updateCounterpartyRequest({
          counterparty_id: id,
          ...counterpartyForm.value,
        });
        ElNotification({
          title: "Успешный запрос",
          message: "Контрагент успешно изменен",
          type: "success",
        });
        hideDrawer();
      } catch (e) {
        console.error({ e });
        ElNotification({
          title: updateCounterpartyError.value?.title ?? "Ошибка",
          message:
            updateCounterpartyError.value?.message ??
            "Произошла ошибка, обратитесь к администратору",
          type: "error",
        });
      }
    });
  };

  const updateCounterpartyContact = async (
    id: number,
    contact_id: number,
    contact: t.ICounterpartyContact
  ): Promise<void> => {
    try {
      await updateCounterpartyContactRequest({
        counterparty_id: id,
        contact_id,
        ...contact,
      });
      await fetchCompaniesCounterpartyContactList({
        counterparty_id: id,
      });

      if (companiesCounterpartyContactResponse.value) {
        counterpartyForm.value.contacts =
          companiesCounterpartyContactResponse.value.items;
      }

      ElNotification({
        title: "Успешный запрос",
        message: "Контакт успешно обновлен",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: updateCounterpartyContactError.value?.title ?? "Ошибка",
        message:
          updateCounterpartyContactError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const updateCounterpartyRequisite = async (
    id: number,
    requisite_id: number,
    requisite: t.ICounterpartyRequisite
  ): Promise<void> => {
    try {
      await updateCounterpartyRequisiteRequest({
        counterparty_id: id,
        requisite_id,
        ...requisite,
      });
      await fetchCompaniesCounterpartyRequisiteList({
        counterparty_id: id,
      });

      if (companiesCounterpartyRequisiteResponse.value) {
        counterpartyForm.value.requisites =
          companiesCounterpartyRequisiteResponse.value.items;
      }

      ElNotification({
        title: "Успешный запрос",
        message: "Реквизит успешно обновлен",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: updateCounterpartyRequisiteError.value?.title ?? "Ошибка",
        message:
          updateCounterpartyRequisiteError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  // DELETE

  const deleteCounterparty = async (id: number): Promise<void> => {
    try {
      await deleteCounterpartyRequest({
        counterparty_id: id,
      });
      await fetchCompaniesCounterpartyList();
      ElNotification({
        title: "Успешный запрос",
        message: "Контрагент успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteCounterpartyError.value?.title ?? "Ошибка",
        message:
          deleteCounterpartyError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const deleteCounterpartyContact = async (
    id: number,
    contact_id: number
  ): Promise<void> => {
    try {
      await deleteCounterpartyContactRequest({
        counterparty_id: id,
        contact_id,
      });
      await fetchCompaniesCounterpartyContactList({
        counterparty_id: id,
      });

      if (companiesCounterpartyContactResponse.value) {
        counterpartyForm.value.contacts =
          companiesCounterpartyContactResponse.value.items;
      }

      ElNotification({
        title: "Успешный запрос",
        message: "Контакт успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteCounterpartyContactError.value?.title ?? "Ошибка",
        message:
          deleteCounterpartyContactError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const deleteCounterpartyRequisite = async (
    id: number,
    requisite_id: number
  ): Promise<void> => {
    try {
      await deleteCounterpartyRequisiteRequest({
        counterparty_id: id,
        requisite_id,
      });
      await fetchCompaniesCounterpartyRequisiteList({
        counterparty_id: id,
      });

      if (companiesCounterpartyRequisiteResponse.value) {
        counterpartyForm.value.requisites =
          companiesCounterpartyRequisiteResponse.value.items;
      }

      ElNotification({
        title: "Успешный запрос",
        message: "Реквизит успешно удален",
        type: "success",
      });
    } catch (e) {
      console.error({ e });
      ElNotification({
        title: deleteCounterpartyRequisiteError.value?.title ?? "Ошибка",
        message:
          deleteCounterpartyRequisiteError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  //upload/download

  const updateCounterpartyFile = async (
    file_id: number,
    description: string
  ) => {
    try {
      const result = await axios.put(
        `${MAIN_ENDPOINT}api/v1/documents/${file_id}?document_id=${file_id.toString()}&company_id=${currentCompanyId.value.toString()}`,
        {
          description,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      ElNotification({
        title: "Успешный запрос",
        message: "Файл успешно обновлен",
        type: "success",
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    companiesManagementLoading,
    companiesManagementList,
    companiesManagementListLoading,
    fetchCompaniesManagementList,
    fetchCompaniesCounterpartyItem,

    initialCounterpartiesParams,
    counterpartiesParams,
    counterpartyForm,
    counterpartyContactForm,
    counterpartyRequisiteForm,
    companiesCounterpartyListLoading,
    companiesCounterpartyContactListLoading,
    companiesCounterpartyRequisiteListLoading,
    companiesCounterpartyListTotalItems,
    companiesCounterpartyList,
    createCounterpartyLoading,
    counterpartyRef,
    counterpartyContactRef,
    counterpartyContactRules,
    counterpartyRequisiteRef,
    counterpartyRequisiteRules,
    counterpartyRules,
    newCopany,
    updatedCompany,
    createCounterparty,
    createCounterpartyContact,
    createCounterpartyRequisite,
    fetchCompaniesCounterpartyList,
    fetchCompaniesCounterpartyContactList,
    fetchCompaniesCounterpartyRequisiteList,
    deleteCounterparty,
    deleteCounterpartyContact,
    deleteCounterpartyRequisite,
    updateCounterparty,
    updateCounterpartyContact,
    updateCounterpartyRequisite,

    clearForm,
    clearContactForm,
    clearRequisiteForm,

    companyGroupName,
    currentCompaniesIdsList,
    currentCompanyId,
    getCompanyName,

    fetchCompaniesCounterpartyDocument,
    updateCounterpartyFile,
  };
};

export const useCounterpartiesUpload = () => {
  const { uploadFileList } = useFiles();
  const upload = (v: UploadUserFile) =>
    uploadFileList([v], "COUNTERPARTY_ATTACHMENT");

  return { upload };
};

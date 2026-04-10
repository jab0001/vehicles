import type { TBalanceOperationsCategory } from "@/types/balanceOperations";
import useApi from "./useApi";
import * as t from "@/types/settings";

export const useSettings = () => {
  const {
    loading: fetchSettingsLoading,
    response: settings,
    request: fetchSettings,
  } = useApi<t.ICompaniesGroupSettings>({
    url: "/api/v1/companies_groups/settings",
    method: "GET",
  });

  const {
    loading: updateSettingsLoading,
    response: updateSettingsResponse,
    request: updateSettings,
  } = useApi<t.ICompaniesGroupSettings, t.ICompaniesGroupSettings>({
    url: "/api/v1/companies_groups/settings",
    method: "PATCH",
  });

  const {
    loading: fetchDebitFundsSettingsLoading,
    response: debitFundsSettings,
    request: fetchDebitFundsSettings,
  } = useApi<
    t.IDebitFundsSettings,
    {
      operation_category: TBalanceOperationsCategory;
    }
  >({
    dynamicUrl: (p) =>
      `/api/v1/companies_groups/settings/debit_funds_settings/${p.operation_category}`,
    method: "GET",
  });

  const {
    loading: createDebitFundsSettingsLoading,
    response: createDebitFundsSettingsResponse,
    request: createDebitFundsSettings,
  } = useApi<t.IDebitFundsSettings, t.IDebitFundsSettingsCreateForm>({
    dynamicUrl: (p) =>
      `/api/v1/companies_groups/settings/debit_funds_settings/${p.operation_category}`,
    method: "POST",
  });

  const {
    loading: updateDebitFundsSettingsLoading,
    response: updateDebitFundsSettingsResponse,
    request: updateDebitFundsSettings,
  } = useApi<t.IDebitFundsSettings, t.IDebitFundsSettingsUpdateForm>({
    dynamicUrl: (p) =>
      `/api/v1/companies_groups/settings/debit_funds_settings/${p.operation_category}`,
    method: "PUT",
  });

  return {
    fetchSettingsLoading,
    settings,
    fetchSettings,

    updateSettingsLoading,
    updateSettingsResponse,
    updateSettings,

    fetchDebitFundsSettingsLoading,
    debitFundsSettings,
    fetchDebitFundsSettings,

    createDebitFundsSettingsLoading,
    createDebitFundsSettingsResponse,
    createDebitFundsSettings,

    updateDebitFundsSettingsLoading,
    updateDebitFundsSettingsResponse,
    updateDebitFundsSettings,
  };
};

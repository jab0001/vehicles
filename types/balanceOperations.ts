export interface IBalanceOperationListParams {
  driver_id?: number;
  limit?: number;
  page?: number;
  order_by?: string;
  operation_category?: TBalanceOperationsCategory;
  operation_type?: TBalanceOperationsType;
  date_from: string | null;
  date_to: string | null;
  direction?: "asc" | "desc";
  only_correctable?: boolean;
  search?: string;
  user_id?: number;
}
export interface IBalanceOperationByCategoryParams {
  category: TBalanceOperationsCategory;
  limit?: number;
  page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}
export interface IBalanceOperationDetailsParams {
  operation_id: number;
}
export interface IBalanceOperationEditParams
  extends IBalanceOperationDetailsParams {
  amount: number;
  user_description: string;
  cash_register_id: number | null;
}

export interface IBalanceOperationForm {
  driver_id: number | undefined;
  amount: number | string;
  amount_type: TBalanceOperationsAmountType;
  operation_category: TBalanceOperationsCategory;
  operation_type: TBalanceOperationsType;
  user_description: string;
  origin_type?: string | null;
  origin_id?: number | null;
  parent_operation_id?: number | null;
  cash_register_id?: number | null;
  category_from: TTransferCategory | undefined;
  category_to: TTransferCategory | undefined;
}
export interface IBalanceOperationDetails extends IBalanceOperationForm {
  id: number;
  company_group_id: number;
  user_id: number;
  document_id: number;
  system_description: string;
  is_accounted: boolean;
  created_at: string;
  is_updatable: boolean;
}

export interface IBalanceOperationTransferForm {
  driver_id: number;
  amount: number | string;
  category_from: TTransferCategory;
  category_to: TTransferCategory;
}

export type TTransferCategory =
  | "rent"
  | "fine"
  | "toll_road"
  | "other"
  | "franchise"
  | "damage"
  | "deposit"
  | "repayment_damage"
  | "repayment_franchise"
  | "repayment_deposit"
  | "unallocated_funds"
  | "redemption";

export interface IBalanceOperationTotal {
  by_category: Record<TBalanceOperationsCategory, string>;
  total: string;
}

export type TBalanceOperationsCategory =
  | "rent"
  | "fine"
  | "toll_road"
  | "other"
  | "franchise"
  | "damage"
  | "deposit"
  | "repayment_damage"
  | "repayment_franchise"
  | "repayment_deposit"
  | "unallocated_funds"
  | "redemption"
  | "transfer";

export type TBalanceOperationsType = "accrual" | "cash_register";
export type TBalanceOperationsAmountType = "positive" | "negative";

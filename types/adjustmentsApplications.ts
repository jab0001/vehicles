import type { TBalanceOperationsCategory } from "./balanceOperations";

export interface IAdjustmentsApplicationForm {
  driver_id: number | undefined;
  request: string;
  comment: string;
  operation_category: TBalanceOperationsCategory | null;
  operation_id: number | undefined;
  amount_requested: string;
  amount_type: TAdjustmentsApplicationAmountType;
  status?: TAdjustmeontOperationStatus;
  driver_fio: string;
  // id: number | undefined;
  // status: TAdjustmeontOperationStatus;
  // chosenStatus: TAdjustmeontOperationStatus;
  // driver_id: number | undefined;
  // amount_type: TAdjustmentsApplicationAmountType;
  // operation_id: number | null;
  // operation_category: TBalanceOperationsCategory;
  // operation_type: TAdjustmentsApplicationOperationType;
  // amount_requested: number;
  // request: string;
  // comment: string;
  // driver_fio: string;
  // amount_agreed: string;
}
export interface IAdjustmentsApplicationCreateForm {
  driver_id: number;
  operation_id: number | null;
  operation_category?: TBalanceOperationsCategory | null;
  amount_requested: number | string;
  request?: string;
  comment: string;
}

export type TAdjustmeontOperationStatus =
  | "pending"
  | "agreed"
  | "rejected"
  | "done"
  | "";
export type TAdjustmentsApplicationAmountType = "positive" | "negative";

export type TAdjustmentsApplicationOperationType = "article" | "operation";
export interface IAdjustmeontOperationListParams {
  driver_id?: number;
  limit?: number;
  page?: number;
  search: string;
  start_date?: string;
  end_date?: string;
}
export interface IAdjustmeontOperationDetailsParams {
  adjustment_id: number | string;
}
export interface IAdjustmeontOperationEditParams {
  id: number;
  comment: string;
  amount_agreed?: number | string | null;
}
export interface IAdjustmeontOperationEditStatusParams {
  id: number;
  status: TAdjustmeontOperationStatus;
}

export interface IAdjustmentsApplication extends IAdjustmentsApplicationForm {
  id: number;
  amount_agreed: string;
  companies_group_id: number;
  status: TAdjustmeontOperationStatus;
  created_at: string;
  updated_at: string;
}

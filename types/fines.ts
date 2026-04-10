import type { TDefaultSortDirection } from "./apiDefault";
import type { IDriver } from "./drivers";
import type { IVehicle } from "./vehicles";

export interface IFineListParams {
  no_driver?: boolean;
  counterparty_id?: number;
  driver_id?: number;
  datetime_start?: string;
  datetime_end?: string;
  datetime_type?: TFineDatetimeType;
  query?: string;
  limit?: number;
  page?: number;
  order_by?: string;
  search?: string;
  direction?: TDefaultSortDirection;
  statuses?: TFineStatus[];
  local_statuses?: TFineLocalStatus[];
}
export interface IFineEditParams {
  driver_id: number;
  vehicle_id: number;
  local_status: TFineLocalStatus;
  id: number;
  document_ids: number[];
}
export interface IFineDetailsParams {
  fine_id: number;
}

export type TFineLocalStatus =
  | "paid"
  | "paid_with_discount"
  | "not_paid"
  | "not_paid_with_discount"
  | "not_accrued"
  | "canceled"
  | "";
export type TFineDatetimeType = "created_at" | "bill_date" | "issued_date";
export type TFineStatus = "paid" | "not_paid" | "canceled" | "";

export interface IFineForm {
  number: string; // № постановления
  company_id: number | undefined; //
  vehicle_id: number | undefined; //
  driver_id: number | undefined; //
  price: number | string; // Сумма штрафа
  discount_price: number | string | null; // Со скидкой
  commission: number | string; // Комиссия
  status: TFineStatus; // Статус в ГИБДД
  koap_code: string | null;
  koap_text: string | null;
  local_status: TFineLocalStatus; // Статус водителя
  bill_date: string; // дата постановления
  issued_date: string; // дата штрафа
  discount_expires_at: string; // Скидка до
  comment: string; // Примечание
  document_ids: number[]; // ID файлов
  documents?: {
    id: number;
    uuid: string;
    name: string;
    type: string;
  }[];
}
export interface IFine extends IFineForm {
  id: number;
  driver: null | IDriver;
  vehicle: null | IVehicle;
  companies_group_id: number;
  discount_expires_at: string;
  last_balance_operation: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  is_driver_balance_operations_exists: boolean;
  source: 'internal' | 'external';
}

/**
 * driver app fines
 */
export interface IDriverAppFineListParams {
  limit?: number;
  page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

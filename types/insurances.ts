import type { TDefaultSortDirection } from "./apiDefault";

export type TInsuranceStatus =
  | "IN_PROGRESS" // В процессе
  | "DONE" // завершен
  | "";
export type TInsuranceCulprit =
  | "NOT_DEFINED" // Не определено
  | "DRIVER" // водитель
  | "THIRD_PARTY" // третье лицо
  | "MUTUAL" // обоюдное
  | "";
export type TInsuranceType =
  | "osago"
  | "osgop"
  | "kasko"
  | "passenger"
  | "do_osago";
export interface IInsurancesListParams {
  order_by: string;
  direction?: TDefaultSortDirection;
  limit?: number;
  page?: number;
  insurance_statuses: string[];
  expires_after_days_delta: number | null;
  insurance_types: string[];
  query?: string;
}

export interface IInsurancesStatisticParams {
  insurance_statuses?: string[];
  expires_after_days_delta?: number | null;
  insurance_types_active: TInsuranceType[];
  insurance_types_expires: TInsuranceType[];
  cars_without_insurance_types: TInsuranceType[];
  query?: string;
}

export interface IInsurance {
  id: number;
  vehicle_id: number;
  plate_number: string;
  vehicle_name: string;
  company_id: number;
  company_name: string;
  insurance_number: string;
  insurance_type: TInsuranceType;
  issued_by_id: number;
  insurance_amount: string;
  document_ids: number[];
  documents?: {
    id: number;
    uuid: string;
    name: string;
    type: string;
  }[];
  issued_date: string;
  description: string;
  expires_at: string;
  created_at: string;
  deleted_at: string;
}

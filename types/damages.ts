import type { TDefaultSortDirection } from "./apiDefault";
import type { IDriver } from "./drivers";
import type { IVehicle } from "./vehicles";

export type TDamageStatus =
  | "IN_PROGRESS" // В процессе
  | "DONE" // завершен
  | "";
export type TDamageCulprit =
  | "NOT_DEFINED" // Не определено
  | "DRIVER" // водитель
  | "THIRD_PARTY" // третье лицо
  | "MUTUAL" // обоюдное
  | "";
export type TDamageType =
  | "DAMAGE" // Повреждение
  | "EUROPROTOCOL" // Европротокол
  | "ACCIDENT" // ДТП
  | "INSPECTION" //Осмотр
  | "";
export interface IDamagesListParams {
  limit?: number;
  page?: number;
  driver_id?: number;
  vehcile_id?: number;
  search?: string;
  order_by: string;
  direction?: TDefaultSortDirection;
  statuses?: TDamageStatus[];
  damage_types?: TDamageType[];
  culprits?: TDamageCulprit[];
  start_date?: string;
  end_date?: string;
  period_type?: "created_at" | "event_time";
}

export interface IDamageDetailsParams {
  damage_id: number;
}
export interface IDamageEditParams extends IDamageForm {
  id: number;
}
export interface IDamageForm {
  certificate_number: string;
  certificate_date: string;
  payed_sum: number | string;
  damage_type: TDamageType;
  status: TDamageStatus;
  cost: number | string;
  culprit: TDamageCulprit;
  driver_id?: number | null;
  vehicle_id: number | null;
  place?: string | null;
  reason?: string | null;
  damage?: string | null;
  event_time: string;
  files: number[];
}
export interface IDamage extends IDamageForm {
  id: number;
  vehicle: IVehicle;
  driver: IDriver;
  source?: string;
  source_id?: number;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}

/**
 * driver app damages
 */
export interface IDriverAppDamagesListParams {
  limit?: number;
  page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

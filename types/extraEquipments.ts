export type TExtraEquipmentCharge =
  | "all_days"
  | "work_days"
  | "weekend_days"
  | "";

export interface IExtraEquipmentForm {
  name: string;
  price: number | string;
  charge_at: TExtraEquipmentCharge;
}
export interface IExtraEquipmentDetailsParams {
  equipment_id: number;
}
export interface IExtraEquipmentEditParams extends IExtraEquipmentForm {
  equipment_id: number;
}

export interface IExtraEquipment extends IExtraEquipmentForm {
  id: number;
}

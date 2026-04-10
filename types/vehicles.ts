import type { EpPropMergeType } from "element-plus/es/utils/index.mjs";
import type { TDefaultSortDirection } from "./apiDefault";
import type { ICounterparty } from "./companiesManagement";
import type { IExtraEquipment } from "./extraEquipments";

export interface IVehicleDetailParams {
  company_id: number;
  vehicle_id: number;
}

// export interface IVehicleFormSTSPart {
//   sts?: string;
//   date?: string;
//   plateNumber?: string;
//   vin?: string;
//   carBrand?: string;
//   carModel?: string;
//   carType?: string;
//   carCategory?: string;
//   transmission?: string;
//   carYear?: string;
//   engineNumber?: string;
//   bodyNumber?: string;
//   matchesBodyVin?: boolean;
//   carColor?: string;
//   enginePower?: string;
//   owner?: string;
//   note?: string;
//   stsFileList?: UploadUserFile[];
// }

export interface IVehicleFormSTSPart
  extends IVehicleStsMain,
    IVehicleMain,
    IVehicleRelation {
  comment: string;
  fuel_type?: string;
}
export interface IVehicleForm extends IVehicleFormSTSPart {}

export interface IVehicleUpdateStsParams extends IVehicleStsMain {
  vehicle_id: number;
  company_id: number;
}

export interface IVehicleCreateParams
  extends IVehicleFormSTSPart,
    IVehicleRegistrationCertificate,
    IVehicleDealPart,
    IVehicleOtherPart {
  sts?: IVehicleStsMain;
  counterparty_id?: number;
  document_ids?: number[];
  company_unit_id?: number | null;
}

export interface IVehicleUpdateParams
  extends IVehicleFormSTSPart,
    IVehicleRentRedemptionPart,
    IVehicleRegistrationCertificate,
    IVehicleDealPart {
  comment: string;
  counterparty?: object;
  document_ids?: number[];
  company_unit_id?: number | null;
}

export type TVehicleOrderParam =
  | "created_at"
  | "manufacture_date"
  | "registration_certificate_date"
  | "plate_number"
  | "engine_number"
  | "body_number";
export type TVehicleDirectionParam = "asc" | "desc";
export interface IFetchVehiclesParams {
  company_ids?: number[];
  company_units?: number[];
  detail?: boolean;
  company_id?: number[];
  limit: number;
  page: number;
  plate_number?: string;
  brand_id?: number;
  car_model_id?: number;
  owner_company_id?: number;
  order_by?: TVehicleOrderParam;
  direction?: TVehicleDirectionParam;
  is_on_line?: boolean;
  query?: string;
  disposal?: boolean;
  vehicles_ids?: number[];
  contracts_ids?: number[];
  statuses?: TLeasingStatus[];
  without_insurance?: string[];
}

export interface IVehicleCompany {
  id: number;
  companies_group_id: number;
  inn: string;
}

export interface IVehicleBrand {
  id: number;
  brand: string;
}

export interface IVehicleCarModel {
  id: number;
  brand_id: number;
  car_model: string;
}

export interface IVehicleColor {
  id: number;
  color: string;
}

// export interface IVehicle {
//   id: number;
//   company_id: number;
//   company: IVehicleCompany;
//   owner_company_id: number;
//   owner_company: IVehicleCompany;
//   brand_id: number;
//   brand: IVehicleBrand;
//   car_model_id: number;
//   car_model: IVehicleCarModel;
//   color_id: number;
//   color: IVehicleColor;
//   plate_number: string;
//   manufacture_date: string;
//   body_number: string;
//   vin: string;
//   engine_number: string;
//   registration_certificate_number: string;
//   registration_certificate_date: string;
//   vehicle_data_sheet_number: string;
//   engine_horsepower: number;
//   engine_power: number;
//   is_on_line: boolean;
//   last_inspection_mileage: number | null;
//   sts: string | null;
//   osago: string | null;
//   created_at: string;
//   updated_at: string | null;
//   deleted_at: string | null;
// }

export interface IVehicleCompany {
  id: number;
  companies_group_id: number;
  inn: string;
}

export interface IVehicleBrand {
  id: number;
  brand: string;
}

export interface IVehicleCarModel {
  id: number;
  brand_id: number;
  car_model: string;
}

export interface IVehicleColor {
  id: number;
  color: string;
}

export interface IVehicleStsRelation {
  id: number;
  vehicle_id: number;
  created_at: string;
}

export interface IVehicleStsMain {
  sts_number: string;
  issued_date?: string | undefined;
  expires_at?: string | undefined;
  mod_spec_country?: string;
}

export interface IVehicleSts extends IVehicleStsRelation, IVehicleStsMain {}

export interface IVehicleOsago {
  id: number;
  vehicle_id: number;
  insurance_number: string;
  insurance_type: string;
  issued_date: string;
  issued_by: string;
  expires_at: string;
  created_at: string;
}

export interface IVehicleMain {
  id?: number;
  vin: string;
  plate_number: string;
  body_number: string;
  engine_number: string;
  manufacture_date: string;
  manufacture_year: string | null;
  vehicle_data_sheet_number: string;
  engine_horsepower: number;
  fullname?: string;
  engine_power?: number | null;
}

export interface IVehicleRelation {
  mod_spec_country?: string;
  company_id: number;
  counterparty_id?: number;
  counterparty?: ICounterparty;
  brand_id?: number;
  car_model_id?: number;
  color_id?: number;
}

export interface IVehicleRegistrationCertificate {
  registration_certificate_number: string;
  registration_certificate_date: string;
}

export interface IVehicle
  extends IVehicleMain,
    IVehicleRelation,
    IVehicleOtherPart,
    IVehicleLicencePart,
    IVehicleIssuanceProhibitionPart,
    IVehicleDealPart {
  company?: IVehicleCompany;
  owner_company?: IVehicleCompany;
  brand?: IVehicleBrand;
  car_model?: IVehicleCarModel;
  color?: IVehicleColor;
  fuel_type?: string;
  is_on_line: boolean;
  last_inspection_mileage: number | null;
  current_mileage: number | null;
  current_mileage_at: string;
  last_diagnostic_card?: IVehicleDiagnosticCard | null;
  sts: IVehicleSts | null;
  osago: IVehicleOsago | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  documents?: {
    id: number;
    uuid: string;
    name: string;
    type: string;
  }[];
  document_ids?: number[];
  periodic_debit_type?: TVehiclePeriodicDebitType;
  rent_template_id?: number;
  redemption_amount?: number;
  redemption_driver_expense?: boolean;
  redemption_driver_id?: number;
  redemption_expiration?: string;
  redemption_franchise_cost?: number;
  redemption_deposit_cost?: number;
  rent_amount?: number;
  comment: string;
}

// insurance
export type TVehicleInsurancesOrderTypes =
  | "osago"
  | "kasko"
  | "passenger"
  | "do_osago"
  | "diagnostic_card";
export interface IVehicleInsuranceForm {
  id?: number;
  issued_by_id?: number;
  insurance_amount: string | number;
  insurance_number: string;
  insurance_type: TVehicleInsurancesOrderTypes | undefined;
  issued_date: string;
  description: string;
  expires_at: string;
  document_ids: number[];
  vehicle?: IVehicle;
  documents?: {
    id: number;
    uuid: string;
    name: string;
    type: string;
  }[];
}
export interface IVehicleInsuranceAddParams extends IVehicleInsuranceForm {
  vehicle_id: number;
  company_id: number;
}
export interface IVehicleInsurancesParams {
  vehicle_id: number;
  company_id: number;
  include_historical?: boolean;
  company_ids?: string;
  order_by?: TVehicleInsurancesOrderTypes;
  direction?: TDefaultSortDirection;
}
export interface IVehicleInsurance extends IVehicleInsuranceForm {
  id: number;
  vehicle_id: number;
  created_at: string;
}

//mileage

export interface IMileageFetchResponse {
  items: IVehicleMileage[];
  total_pages: number;
  current_page: number;
  page_items: number;
  total_items: number;
}

export interface IVehicleMileageParams {
  vehicle_id: number;
  sources: number[];
  limit: number;
  page: number;
}

export interface IVehicleInsuranceAddParams extends IVehicleMileageForm {
  vehicle_id: number;
}

export interface IVehicleMileageForm {
  mileage: number | null;
}

export interface IVehicleMileage {
  id: number;
  vehicle_id: number;
  mileage: number;
  source: number;
  trusted: boolean;
  created_at: string;
  event_date: string;
  created_by_someone: number | null;
  created_by_type: number | null;
  someone_fio: string;
  mileage_diff: number;
}

//leasing

export interface IVehicleLeasingWidget {
  need_to_pay: string;
  current_month_payed: string;
  active_contracts: number;
  done_contracts: number;
  closed_contracts: number;
  paid: string;
  remains: string;
  coming_contracts: string;
  late_contracts: [
    {
      id: number;
      vehicle: {
        car_name: string;
        plate_number: string;
      };
      number: string;
      payment_periodic_date: string;
      payment_periodic_amount: string;
    },
  ];
}
export interface IVehicleLeasing {
  _activeTab?:
    | EpPropMergeType<
        readonly [StringConstructor, NumberConstructor],
        unknown,
        unknown
      >
    | undefined;
  _open?: boolean;
  id: number;
  companies_group_id: number;
  lessor_id: number;
  lessee_id: number;
  vehicle_id: number;
  vehicle_brand: string;
  vehicle_car_model: string;
  vehicle_plate_number: string;
  number: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  down_payment: string;
  status: TLeasingStatus;
  closed_reason: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  schedule_payments_sum?: number;
  actual_payments_sum?: number;
  document_ids: number[];
  documents?: {
    id: number;
    uuid: string;
    name: string;
    type: string;
  }[];
}

export interface IVehicleLeasingSchedulePaymentForm {
  amount: string | number | null;
  month: string;
  payment_date: string;
  status?: TLeasingStatus;
}

export interface IVehicleLeasingActualPaymentForm {
  schedule_payment_id?: number;
  amount: number | string;
}

export interface IVehicleLeasingSchedulePayment
  extends IVehicleLeasingSchedulePaymentForm {
  id: number;
  leasing_contract_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface IVehicleLeasingActualPayment {
  id: number;
  leasing_contract_id: number;
  schedule_payment_id: number;
  created_by_fio: string;
  amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface IVehicleLeasingForm {
  lessor_id?: number;
  lessee_id?: number;
  vehicle_id: number | null;
  number: string;
  start_date: string;
  end_date: string;
  total_amount: number | string | null;
  down_payment: number | string | null;
  payment_day?: number;
  payment_periodic_amount: number | string | null;
  document_ids: number[];
}

export type TLeasingStatus = "NOT_PAID" | "PAID" | "CANCELED" | "OVERDUE" | "";

// diagnostic cards
export interface IVehicleDiagnosticCardForm {
  registration_number: string;
  issued_date: string;
  expires_at: string;
}
export interface IVehicleDiagnosticCardsListParams {
  vehicle_id: number;
  limit?: number;
  page?: number;
}
export interface IVehicleDiagnosticCardAddParams
  extends IVehicleDiagnosticCardForm {
  vehicle_id: number;
}
export interface IVehicleDiagnosticCardRemoveParams {
  diagnostic_card_id: number;
  vehicle_id: number;
}
export interface IVehicleDiagnosticCard
  extends IVehicleDiagnosticCardAddParams {
  id: number;
  created_at: string;
  deleted_at: string;
}

export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum AccrualType {
  DAILY = "Ежедневный",
  WEEKLY = "Eженедельный",
  MONTHLY = "Ежемесячный",
}
export type TAccrualType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface IVehicleRentTemplateCreateParams {
  name: string;
  accrual_type: TAccrualType;
  rent_cost: number;
  franchise_cost: string | number;
  deposit_cost: string | number;
}

export interface IVehicleRentTemplate {
  name: string;
  accrual_type: TAccrualType;
  first_day_off_in: number;
  days_off: Day[];
  rent_cost: number;
  franchise_cost: number;
  deposit_cost: number;
  id?: number;
  is_active?: boolean;
}

export interface IVehicleRentTemplateCreateResponse {
  name: string;
  accrual_type: TAccrualType;
  first_day_off_in: number;
  days_off: Day[];
  rent_cost: number;
  franchise_cost: string | number;
  deposit_cost: string | number;
  id?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IVehicleRentTemplatePredictChargeDate
  extends Omit<
    IVehicleRentTemplateCreateResponse,
    "id" | "is_active" | "created_at" | "updated_at"
  > {}

export interface IVehicleRentTemplateUpdateParams {
  template_id: number;
  name: string;
  accrual_type: TAccrualType;
  first_day_off_in?: number;
  days_off?: Day[];
  rent_cost: number;
  franchise_cost: string | number;
  deposit_cost: string | number;
  is_active?: boolean;
}

export interface IVehicleRentRedemptionPart {
  rent_template_id?: number | null;
  rent_amount?: number | null;
  redemption_driver_id?: number;
  redemption_amount?: number | null;
  redemption_expiration?: string;
  redemption_franchise_cost: number | null;
  redemption_deposit_cost: number | null;
  redemption_driver_expense?: boolean;
  periodic_debit_type?: TVehiclePeriodicDebitType;
}

export interface IVehicleRentParams {
  is_active: boolean;
  limit?: number;
  page?: number;
  search?: string;
}

export interface IVehicleRentTemplateDetailParams {
  template_id: number;
}

export interface IVehicleRentTemplatesResponse {
  items: IVehicleRentTemplate[];
  total_pages: number;
  current_page: number;
  page_items: number;
  total_items: number;
}

export type TVehiclePeriodicDebitType = "" | "RENT" | "REDEMPTION";

export interface IVehicleExtraEquipmnet extends IExtraEquipment {
  deleted_at: string;
}

export interface IVehicleEquipment extends IVehicleEquipmentForm {
  vehicle_id: number;
}

export interface IVehicleEquipmentForm {
  id?: number;
  inspection_types?: string[];
  serial?: string;
  comment?: string;
  checkbox?: boolean;
  lost_cost?: number;
  template_id: number | undefined;
  template_lost_cost?: string;
}

export interface IVehicleExtraEquipmnetParams {
  vehicle_id: number;
  company_id: number;
  with_removed?: boolean;
}

export type TVehiclePossessionType = "leasing" | "purchased" | "rented";
export type TVehicleSecondKeyLocationType = "in_owners_company" | "we_have";
export type TVehicleDisposalReasonType =
  | "nonpayment_lease_payments"
  | "utilisation"
  | "stolen"
  | "buyout";
export interface IVehicleDealPart {
  company_id: number;
  purchase_amount?: number | null;
  possession_status: TVehiclePossessionType | null;
  purchase_date?: string;
  second_key_location?: TVehicleSecondKeyLocationType;

  leasing_amount?: number | null;
  leasing_company?: number;
  leasing_contract_number?: string;
  leasing_contract_date_issued?: string;
  leasing_contract_date_end?: string;

  disposal?: boolean;
  disposal_date?: string;
  disposal_reason?: TVehicleDisposalReasonType;
  disposal_sales_amount?: number;

  rent_contract_amount?: number | null;
  rent_contract_renter?: number;
  rent_contract_number?: string;
  rent_contract_date_issued?: string;
  rent_contract_date_end?: string;
}

export interface IVehicleLicencePart {
  licence_series: string;
  licence_issued_date: string | null;
  licence_expires_at: string | null;
}

export interface IVehicleOtherPart {
  vehicle_type?: {
    vehicle_type: string;
    id: number;
  };
  vehicle_type_id?: number;
  tire_diameter: 13 | 14 | 15 | 16 | 17;
  company_unit: IVehicleCompanyUnit | null;
  pts_number: string;
  maintenance_plan: "default";
  start_cost: string | number | null;
  inspection_profile_id: number;
}

export interface IVehicleCompanyUnit {
  id: number;
  name: string;
  company_id: number;
}

export interface IVehicleDowntimeReason {
  id: number;
  name: string;
  company_group_id: number;
  code: string;
  created_by: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  updated_by: number;
  deleted_at: string;
  deleted_by: number;
}

export interface IVehicleGroup {
  id: number;
  name: string;
  company_id: number;
}

export interface IVehicleParkingPlace {
  company_group_id: number;
  name: string;
  created_by: number;
  id: number;
  created_at: string;
}

export interface IVehicleParkingPlaceCreateForm {
  name: string;
}

export interface IVehicleDowntimeReasonCreateForm {
  downtime_reason_id: number;
  description: string;
  parking_place_id: number | null;
}

export interface IVehicleIssuanceProhibitionPart {
  issuance_prohibition?: boolean;
  issuance_prohibition_reason?: string;
}

// geoposition

export interface IVehicleGeopositionParams {
  vehicle_id: number;
}
export interface IVehicleGeoposition {
  vehicle_id: number;
  course: number;
  speed: string;
  latitude: string;
  longitude: string;
  address: string;
  record_time: string;
}

export interface IVehicleIntegration {
  integration_id: number;
  integration_key: string;
  vehicle_id: number;
  created_by: number;
  id: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  name: string;
  type: "YANDEX" | "CITYMOBIL" | "UBER" | "GETT";
}

export interface IVehicleIntegrationCreateForm {
  integration_id: number;
  integration_key: string;
}

export interface IVehicleIntegrationUpdateForm {
  integration_id: number;
  integration_key: string;
}

export interface IVehicleIntegrationsListParams {
  vehicle_id: number;
  limit?: number;
  page?: number;
}

export interface IVehicleIntegrationDetailParams {
  vehicle_id: number;
  integration_vehicle_id: number;
}

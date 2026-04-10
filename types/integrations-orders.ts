export interface IIntegrationOrder {
  id: number;
  integration_driver_id: number;
  external_id: string;
  status: "none" | "pending" | "completed" | "cancelled";
  category: "econom" | "comfort" | "business";
  tariff: string;
  started_at: string;
  ended_at: string;
  address_from: string;
  address_to: string;
  amount: string;
  payment_method:
    | "cash"
    | "cashless"
    | "card"
    | "internal"
    | "corp"
    | "prepaid"
    | "other";
  use_manual_working_shift_record: boolean;
  manual_working_shift_record_id: number;
  created_at: string;
  updated_at: string;
  integration_id: number;
  integration_type: "YANDEX" | "CITYMOBIL" | "UBER" | "GETT";
  driver_id: number;
  driver_full_name: string;
  vehicle_on_line_id: number;
  vehicle_id: number;
  vehicle_plate_number: string;
  vehicle_brand: string;
  vehicle_model: string;
  company_group_id: number;
  company_group_name: string;
  company_id: number;
  company_name: string;
  working_shift_record_id: number;
  working_shift_record: {
    id: number;
    created_at: string;
    updated_at: string;
    updated_by: number;
    created_by: number;
    working_shift_condition_id: number;
    period: {
      start: string;
      end: string;
    };
    status: "WORK";
    working_shift_vehicle_id: number;
    working_shift_driver_id: number;
    vehicle_full_name: string;
  };
  amount_cash: string;
}

export interface IIntegrationOrdersListParams {
  limit?: number;
  page?: number;
  search?: string;
  integration_type?: "YANDEX" | "CITYMOBIL" | "UBER" | "GETT";
  payment_method?: string;
  company_id?: number;
  start_date?: string;
  end_date?: string;
  not_matched_in_salary_statement_id?: number;
}

export interface IIntegrationOrdersListResponse {
  items: IIntegrationOrder[];
  total_pages: number;
  current_page: number;
  page_items: number;
  total_items: number;
}

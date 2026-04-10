import type { TBalanceOperationsCategory } from "./balanceOperations";

export interface ICompaniesGroupSettings {
  id: number;
  companies_group_id: number;
  fine_fee_percent: number;
  fine_fee_rub: number;
  toll_roads_fee_percent: number;
  toll_roads_fee_rub: number;
  fine_discount_offset_days: number;
  show_counterparties_fines_ids: number[] | null;
  debt_repayment: string[] | null;
  default_terminal_id: number | null;
  allowed_payment_categories: string[] | [];
  accrual_processing_time: string;
  accrual_processing_time_local: string;
  created_at: string;
  except_balance_categories: string[];
  debit_funds_split_by_category: boolean;
  max_franchise: number | null;
  max_deposit: number | null;
  salary_statements_advance_percentage: string | null;
  salary_statements_advance_categories: string[] | [];
  salary_statements_final_categories: string[] | [];

  toll_roads_enable_drivers_accruals: boolean;
  fines_enable_drivers_accruals: boolean;
  damage_cost_by_damage_price: Record<number, number> | null;

  trusted_mileage_sources: string[] | [];
  absolute_technical_inspection_mileage: boolean;
}

export interface IDebitFundsAmountCondition {
  balance_to: number;
  amount: number;
}

export interface IDriversDamageSettings {
  damage_cost_by_damage_price: Record<number, number>;
}

export interface IDebitFundsSettings {
  allow_partial_debit: boolean;
  min_balance_after_debit: number;
  min_amount_to_debit: number | null;
  max_amount_to_debit: number | null;
  max_daily_amount_to_debit: number | null;
  amount_conditions: IDebitFundsAmountCondition[] | null;
}

export interface IDebitFundsSettingsCreateForm extends IDebitFundsSettings {
  operation_category: TBalanceOperationsCategory;
  driver_id?: number;
}

export interface IDebitFundsSettingsUpdateForm extends IDebitFundsSettings {
  operation_category: TBalanceOperationsCategory;
  driver_id?: number;
}

export interface IDebitFundsSettingsDelete {
  operation_category: TBalanceOperationsCategory;
  driver_id: number;
}

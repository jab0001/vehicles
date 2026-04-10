export interface IPagination<T> {
  items: T[];
  total_pages: number;
  current_page: number;
  page_items: number;
  total_items: number;
}

export type TDefaultSortDirection = "asc" | "desc";
export type TDefaultElPlusTypes =
  | "success"
  | "warning"
  | "info"
  | "primary"
  | "danger";

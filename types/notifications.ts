import type { TDefaultSortDirection } from "./apiDefault";

export interface INotification {
  event_type: "damage" | "fine"; // TODO types
  id: number;
  message: string;
  read_at: null | string;
  title: string;
  user_id: number;
}

export interface INotificationListParams {
  limit?: number;
  page?: number;
  order_by?: any;
  direction?: TDefaultSortDirection;
  is_read?: boolean;
}

export interface INotificationReadParams {
  notification_id: number;
}

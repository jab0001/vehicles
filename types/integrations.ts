export type IIntegration =
  | (IYandexIntegration & IIntegrationMeta)
  | (IStarLineIntegration & IIntegrationMeta)
  | (IGlonassSoftIntegration & IIntegrationMeta);

interface IIntegrationMeta {
  enabled: boolean;
  company_group_id: number;
  created_by: number;
  id: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export interface IIntegrationBase {
  name: string;
  type: IIntegrationTypes;
}

export interface IYandexIntegration extends IIntegrationBase {
  type: "YANDEX";
  credentials: {
    api_key?: string;
    client_id: string;
    park_id: string;
  };
}

export interface IStarLineIntegration extends IIntegrationBase {
  type: "STARLINE";
  credentials: {
    app_id: string;
    secret?: string;
    login: string;
    password?: string;
  };
}

export interface IGlonassSoftIntegration extends IIntegrationBase {
  type: "GLONASS_SOFT";
  credentials: {
    login: string;
    token?: string;
    password?: string;
  };
}

export interface IIntegrationsListParams {
  limit?: number;
  page?: number;
  type?: IIntegrationTypes;
  enabled?: boolean;
}

export type IIntegrationCreateForm = IYandexIntegration | IStarLineIntegration | IGlonassSoftIntegration;

export type IIntegrationTypes = "YANDEX" | "STARLINE" | "GLONASS_SOFT";

export type IIntegrationUpdateForm = IIntegrationCreateForm;

// Integration Imports

export type TIntegrationImportType = "driver" | "vehicle";

export type TDriverImportStatus = "working" | "not_working" | "fired";

export type TVehicleImportStatus =
  | "unknown"
  | "working"
  | "not_working"
  | "repairing"
  | "no_driver"
  | "pending";

  export type TIntegrationImportTaskStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "failed";

  export type TIntegrationImportForm =
  | {
      import_type?: "driver";
      integration_id?: number;
      data: IIntegrationImportDriversData;
    }
  | {
      import_type?: "vehicle";
      integration_id?: number;
      data: IIntegrationImportVehiclesData;
    };

export interface IIntegrationImportDriversData {
  driver_status_filter: TDriverImportStatus[] | null;
}

export interface IIntegrationImportVehiclesData {
  vehicle_status_filter: TVehicleImportStatus[] | null;
}

export interface IIntegrationImportDataMap {
  driver: IIntegrationImportDriversData;
  vehicle: IIntegrationImportVehiclesData;
}

export interface IIntegrationImportParams {
  type: TIntegrationImportType;
  integration_id: number;
}

export interface IIntegrationImportStatusesBody {
  status?: TIntegrationImportTaskStatus[] | null;
  type?: TIntegrationImportType[] | null;
}

export interface IIntegrationImportTask {
  id: number;
  integration_id: number;
  status: TIntegrationImportTaskStatus;
  import_type: TIntegrationImportType;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}

export interface IIntegrationImportStatusesParams {
  status?: TIntegrationImportTaskStatus[] | null;
  type?: TIntegrationImportType[] | null;
  limit?: number;
  page?: number;
}

export interface IIntegrationDraftsCreateResponse {
  created: number[];
  failed: IIntegrationDraftCreateError[];
}

export interface IIntegrationDraftCreateError {
  draft_id: number;
  error: string;
}

export interface IIntegrationDraftsCreateBody {
  drafts_ids: number[];
}





export interface KeyValue {
  id: string; // client-side only
  key: string;
  value: string;
  enabled: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  requests: SavedRequest[];
  children: Collection[];
}

export interface SavedRequest {
  id: number;
  collection_id: number;
  name: string;
  method: string;
  url: string;
  headers: string; // JSON string
  params: string; // JSON string
  body: string; // JSON string
  body_type: string;
  auth: string; // JSON string
  auth_type: string;
}

export interface EnvironmentVariable {
  id?: number;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: number;
  name: string;
  is_active: boolean;
  variables: EnvironmentVariable[];
}

export interface HistoryEntry {
  id: number;
  method: string;
  url: string;
  request_headers: string;
  request_body: string;
  body_type: string;
  status_code: number;
  response_headers: string;
  response_body: string;
  response_time_ms: number;
  response_size_bytes: number;
  timestamp: string;
}

export interface Tab {
  id: string;
  name: string;
  method: string;
  isActive: boolean;
  isDirty: boolean;
  savedRequestId?: number;
}

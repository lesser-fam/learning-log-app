export type CrudAction = "index" | "store" | "show" | "update" | "destroy";

export type SortDirection = "asc" | "desc";
export type FetchMode = "all" | "paginate";
export type SearchMode = "partial" | "exact";
export type UpdateMethod = "patch" | "put";
export type DeleteMode = "physical" | "soft";
export type DeleteResponse = "message" | "no-content";
export type LookupMode = "binding" | "find-or-fail";

export interface DesignState {
  action: CrudAction;
  modelName: string;
  resourceLabel: string;
  controllerName: string;
  singularVariable: string;
  pluralVariable: string;
  routePath: string;
  routeParameter: string;
  authentication: boolean;
  ownership: boolean;
  responseMessage: boolean;
  responseFields: string;
  requestClass: string;
  inputFields: string;
  validationRules: string;
  lookupMode: LookupMode;
  transaction: boolean;
  searchEnabled: boolean;
  searchParameter: string;
  searchColumns: string;
  searchMode: SearchMode;
  sortField: string;
  sortDirection: SortDirection;
  secondarySortEnabled: boolean;
  secondarySortField: string;
  secondarySortDirection: SortDirection;
  fetchMode: FetchMode;
  perPage: number;
  eagerLoads: string;
  updateMethod: UpdateMethod;
  deleteMode: DeleteMode;
  deleteResponse: DeleteResponse;
}

export interface ActionDefinition {
  action: CrudAction;
  label: string;
  httpMethod: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  summary: string;
  learningPoint: string;
}

export interface GeneratedTestCase {
  category: "正常系" | "異常系" | "境界値" | "権限";
  title: string;
  steps: string[];
}

export interface GeneratedDesign {
  requestSummary: string[];
  databaseSummary: string[];
  responseSummary: string[];
  flow: string[];
  tests: GeneratedTestCase[];
  routeCode: string;
  controllerCode: string;
  requestCode: string | null;
  testCode: string;
  considerations: string[];
}

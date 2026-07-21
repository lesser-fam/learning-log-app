import { CrudAction, DesignState } from "@/features/design-trainer/types";

export type DataShape = "collection" | "single" | "none";
export type FetchTiming = "mount" | "dependency" | "event";

export interface FrontendDesignState {
  pagePath: string;
  pageTitle: string;
  componentName: string;
  responseTypeName: string;
  dataVariable: string;
  dataShape: DataShape;
  fetchTiming: FetchTiming;
  dependencyName: string;
  responseFields: string;
  loadingState: boolean;
  errorState: boolean;
  emptyState: boolean;
  retryEnabled: boolean;
  formState: boolean;
  successMessageState: boolean;
  redirectPath: string;
}

export interface StateGuide {
  name: string;
  initialValue: string;
  changesWhen: string;
  rerenderResult: string;
}

export interface GeneratedFrontendDesign {
  action: CrudAction;
  flow: string[];
  stateGuides: StateGuide[];
  typeCode: string;
  stateCode: string;
  effectCode: string;
  conditionCode: string;
  pageCode: string;
  tests: string[];
}

export interface StoredFrontendDesign {
  apiDesign: DesignState;
  frontendDesign: FrontendDesignState;
}

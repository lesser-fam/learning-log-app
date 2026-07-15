import { ActionDefinition, DesignState } from "./types";

export const actionDefinitions: ActionDefinition[] = [
  {
    action: "index",
    label: "index",
    httpMethod: "GET",
    summary: "複数件を検索・並び替えして取得する",
    learningPoint: "検索条件、並び順、0件、ページネーションを設計します。",
  },
  {
    action: "store",
    label: "store",
    httpMethod: "POST",
    summary: "入力を検証して新しい1件を登録する",
    learningPoint:
      "入力項目、バリデーション、保存、201レスポンスを設計します。",
  },
  {
    action: "show",
    label: "show",
    httpMethod: "GET",
    summary: "指定された1件を取得する",
    learningPoint: "URLパラメータ、1件取得、関連データ、404を設計します。",
  },
  {
    action: "update",
    label: "update",
    httpMethod: "PATCH",
    summary: "指定された1件の内容を更新する",
    learningPoint: "更新対象、入力検証、部分更新、404・422を設計します。",
  },
  {
    action: "destroy",
    label: "destroy",
    httpMethod: "DELETE",
    summary: "指定された1件を削除する",
    learningPoint: "削除対象、削除方式、権限、削除後レスポンスを設計します。",
  },
];

export const initialDesign: DesignState = {
  action: "index",
  modelName: "LearningLog",
  resourceLabel: "学習記録",
  controllerName: "LearningLogController",
  singularVariable: "learningLog",
  pluralVariable: "learningLogs",
  routePath: "/learning-logs",
  routeParameter: "learningLog",
  authentication: false,
  ownership: false,
  responseMessage: true,
  requestClass: "StoreLearningLogRequest",
  inputFields: "studied_on, goal, activities, next_action",
  validationRules:
    "studied_on: required|date\ngoal: required|string|max:255\nactivities: required|string|max:10000\nnext_action: required|string|max:10000",
  lookupMode: "binding",
  transaction: false,
  searchEnabled: false,
  searchParameter: "search",
  searchColumns: "goal, activities",
  searchMode: "partial",
  sortField: "studied_on",
  sortDirection: "desc",
  secondarySortEnabled: true,
  secondarySortField: "id",
  secondarySortDirection: "desc",
  fetchMode: "all",
  perPage: 15,
  eagerLoads: "",
  updateMethod: "patch",
  deleteMode: "physical",
  deleteResponse: "message",
};

export function defaultsForAction(
  action: DesignState["action"],
  current: DesignState,
): DesignState {
  const requestClass =
    action === "update"
      ? `Update${current.modelName}Request`
      : `Store${current.modelName}Request`;

  return {
    ...current,
    action,
    requestClass,
    responseMessage:
      action !== "destroy" || current.deleteResponse === "message",
  };
}

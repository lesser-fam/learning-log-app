import { DesignState } from "@/features/design-trainer/types";
import { FrontendDesignState } from "./types";

function pageTitleFor(apiDesign: DesignState): string {
  const suffix = {
    index: "一覧",
    store: "登録",
    show: "詳細",
    update: "編集",
    destroy: "削除",
  }[apiDesign.action];

  return `${apiDesign.resourceLabel}${suffix}`;
}

export function frontendDefaults(
  apiDesign: DesignState,
): FrontendDesignState {
  const isIndex = apiDesign.action === "index";
  const isShow = apiDesign.action === "show";
  const isRead = isIndex || isShow;
  const isForm = apiDesign.action === "store" || apiDesign.action === "update";
  const resourceName = apiDesign.modelName || "Resource";

  return {
    pagePath: isIndex
      ? apiDesign.routePath
      : `${apiDesign.routePath}/${isForm && apiDesign.action === "store" ? "new" : `[${apiDesign.routeParameter || "id"}]`}`,
    pageTitle: pageTitleFor(apiDesign),
    componentName: `${resourceName}${apiDesign.action[0].toUpperCase()}${apiDesign.action.slice(1)}Page`,
    responseTypeName: resourceName,
    dataVariable: isIndex
      ? apiDesign.pluralVariable
      : apiDesign.singularVariable,
    dataShape: isIndex
      ? "collection"
      : apiDesign.action === "destroy"
        ? "none"
        : "single",
    fetchTiming: isIndex ? "mount" : isShow ? "dependency" : "event",
    dependencyName: isShow || apiDesign.action === "update" || apiDesign.action === "destroy"
      ? "id"
      : "",
    responseFields: apiDesign.responseFields,
    loadingState: true,
    errorState: true,
    emptyState: isIndex,
    retryEnabled: isRead,
    formState: isForm,
    successMessageState: !isRead,
    redirectPath: apiDesign.routePath,
  };
}

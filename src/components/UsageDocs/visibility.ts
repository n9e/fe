export const HIDE_USAGE_DOCS_KEY = 'privateCloudHideUsageDocs';

export function shouldShowUsageDocs(hideUsageDocs: boolean | undefined, isEnterprise: boolean): boolean {
  return !isEnterprise || !hideUsageDocs;
}

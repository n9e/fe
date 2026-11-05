/**
 * The popovers inside the builder popover ask the context to swallow their own outside click. The instance lives
 * in the commercial package; re-exporting it here keeps the workspace wiring in one place (and mockable).
 */
// @ts-ignore supplied by the commercial package.
export { default } from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder/commonStateContext';

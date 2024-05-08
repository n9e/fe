const en_US = {
  title: 'Built-in Metrics',
  name: 'Name',
  collector: 'Collector',
  typ: 'Type',
  unit: 'Unit',
  unit_tip: 'When drawing, the value is automatically formatted according to the unit of the metric',
  note: 'Description',
  note_preview: 'Description Preview',
  expression: 'Expression',
  add_btn: 'Add Metric',
  clone_title: 'Clone Metric',
  edit_title: 'Edit Metric',
  explorer: 'Explorer',
  closePanelsBelow: 'Close panels below',
  addPanel: 'Add Panel',
  batch: {
    not_select: 'Please select the metric first',
    export: {
      title: 'Export Metrics',
    },
    import: {
      title: 'Import Metrics',
      name: 'Name',
      result: 'Result',
      errmsg: 'Message',
    },
  },
  filter: {
    title: 'Filters',
    title_tip:
      'The purpose of the filter is to narrow the scope of monitoring data queries when clicking on the right metric to view the monitoring data of the metric. If the filter condition {ident="n9e01"} is configured and selected, the query initiated when querying cpu_usage_idle is cpu_usage_idle{ident="n9e01"}, which will greatly reduce the number of query curves',
    add_title: 'Add Filter',
    edit_title: 'Edit Filter',
    import_title: 'Import Filter',
    name: 'Name',
    datasource: 'Datasource',
    datasource_tip: 'Auxiliary data source for querying filter conditions',
    configs: 'Filter Conditions',
    groups_perm: 'Authorized Teams',
    perm: {
      1: 'Read and Write',
      0: 'Read Only',
    },
    build_labelfilter_and_expression_error: 'Failed to build label filter conditions and expressions',
  },
};
export default en_US;

const en_US = {
  modal: {
    title: 'Migration settings',
    success: 'Migration succeeded',
    datasource_variable: 'Datasource variable settings',
    variable_name: 'Variable name',
    variable_name_required: 'Variable name is required',
    datasource_type: 'Datasource type',
    datasource_default: 'Default datasource',
  },
  title: 'Dashboard Migration',
  migrate: 'Migration',
  help: `
  The v6 version will not support global Prometheus cluster switching. The new version can achieve this capability through the panel associated data source variable.
  <br />
  The migration tool will create a data source variable and associate all panels that are not associated with the data source.
  <br />
  The following is a list of dashboards to be migrated. Click the migration button to start the migration.
  `,
};
export default en_US;

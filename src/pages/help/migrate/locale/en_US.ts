const en_US = {
  title: 'Dashboard Migration',
  migrate: 'Migration',
  help: `
  The v6 version will not support global Prometheus cluster switching. The new version can achieve this capability through the panel associated data source variable.
  <br />
  The migration tool will create a data source variable and associate all panels that are not associated with the data source.
  <br />
  The following is a list of dashboards to be migrated. Click the migration button to start the migration.
  `,
  settings: 'Migration Settings',
  success_migrate: 'Migration Success',
  datasource_variable: 'Data Source Variable Settings',
  variable_name: 'Variable Name',
  datasource_default: 'Data Source Default Value',
};
export default en_US;

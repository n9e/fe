const en_US = {
  modal: {
    title: 'Migration settings',
    success: 'Migration succeeded',
    datasource_variable: 'Data source variable settings',
    variable_name: 'Variable name',
    variable_name_required: 'Variable name is required',
    datasource_type: 'Data source type',
    datasource_default: 'Default data source',
  },
  title: 'Dashboard migration',
  migrate: 'Migration',
  help: `
  v6 no longer supports global Prometheus cluster switching. The new version achieves this by binding panels to a data source variable.
  <br />
  The migration tool creates a data source variable and binds all panels that have no data source yet.
  <br />
  Below is the list of dashboards to migrate. Click the migrate button to start.
  `,
};
export default en_US;

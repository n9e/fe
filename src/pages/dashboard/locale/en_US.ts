const en_US = {
  title: 'Dashboards',
  name: 'Name',
  tags: 'Tags',
  ident: 'Ident',
  ident_msg: 'Please enter English letters or numbers or hyphens',
  search_placeholder: 'Search',
  refresh_tip: 'Refresh interval less than step({{num}}s) will not update data',
  refresh_btn: 'Refresh',
  share_btn: 'Share',
  inspect_btn: 'Inspect',
  public: {
    name: 'Public',
    0: {
      confirm: 'Confirm to public?',
      success: 'Public success',
    },
    1: {
      confirm: 'Confirm to cancel public?',
      success: 'Cancel public success',
    },
  },
  create_title: 'Create Dashboard',
  edit_title: 'Edit Dashboard',
  add_panel: 'Add panel',
  cluster: 'Cluster',
  full_screen: 'Full screen',
  exit_full_screen: 'Exit full screen',
  batch: {
    import: 'Import dashboard JSON',
    label: 'Dashboard JSON',
    import_grafana: 'Import Grafana dashboard JSON',
    import_grafana_tip: 'Currently only support import dashboard config of v8+ version, imported panels only support the chart types and features that n9e currently supports',
    import_grafana_tip_version_error: 'Import of dashboard config less than v7 version is not supported',
    import_grafana_tip_version_warning: 'The imported dashboard config version is less than v8, some panels may not be displayed properly, do you want to continue importing?',
    continueToImport: 'Continue to import',
  },
  link: {
    title: 'Links',
    name: 'Name',
    url: 'URL',
    url_tip: `
      Variables usage
      <1 />
      \${variable_name}: dashboard variable value
      <1 />
      \${__field.name}: series name
      <1 />
      \${__field.value}: series value
      <1 />
      \${__field.labels.X}: specified label value
      <1 />
      \${__field.labels.__name__}: metric name
      <1 />
      \${__from}: Unix millisecond
      <1 />
      \${__from_date_seconds}: Unix seconds epoch
      <1 />
      \${__from_date_iso}: ISO 8601/RFC 3339
      <1 />
      The syntax above also works with \${__to}
      `,
    isNewBlank: 'Open in new tab',
  },
  var: {
    btn: 'Add variable',
    title: {
      list: 'Variables',
      add: 'Add variable',
      edit: 'Edit variable',
    },
    name: 'Name',
    name_msg: 'Only support number and character underline',
    label: 'Label',
    type: 'Type',
    hide: 'Hide',
    definition: 'Definition',
    reg: 'Regex',
    reg_tip: 'Optional, can filter options or extract values by regex',
    multi: 'Multi select',
    allOption: 'Include all option',
    allValue: 'Custom all value',
    textbox: {
      defaultValue: 'Default value',
      defaultValue_tip: 'Optional, only as default on initial load',
    },
    custom: {
      definition: 'Custom value',
    },
    constant: {
      definition: 'Constant value',
      defaultValue_tip: 'Define a hidden constant value',
    },
    datasource: {
      definition: 'Datasource type',
      defaultValue: 'Default value',
      regex: 'Datasource name filter',
      regex_tip: 'Optional, can filter options or extract values by regex',
    },
  },
  row: {
    edit_title: 'Edit row',
    delete_title: 'Delete row',
    name: 'Name',
    delete_confirm: 'Confirm to delete row?',
    cancel: 'Cancel',
    ok: 'Delete row and panels',
    ok2: 'Delete row',
  },
  panel: {
    title: {
      add: 'Add panel',
      edit: 'Edit panel',
    },
    base: {
      title: 'Panel options',
      name: 'Title',
      name_tip: 'The table type panel must set the title',
      link: {
        label: 'Links',
        btn: 'Add',
        name: 'Name',
        name_msg: 'Link name is required',
        url: 'URL',
        url_msg: 'Link url is required',
        isNewBlank: 'Open in new tab',
      },
      description: 'Description',
      repeatOptions: {
        title: 'Repeat options',
        byVariable: 'Repeat by variable',
        byVariableTip: 'Repeat the panel for each value of the variable',
        maxPerRow: 'Max per row',
      },
    },
    options: {
      legend: {
        displayMode: {
          label: 'Display mode',
          table: 'Table',
          list: 'List',
          hidden: 'Hidden',
        },
        placement: 'Placement',
        max: 'Max',
        min: 'Min',
        avg: 'Avg',
        sum: 'Sum',
        last: 'Last',
        columns: 'Columns',
      },
      thresholds: {
        title: 'Thresholds',
        btn: 'Add',
      },
      tooltip: {
        mode: 'Mode',
        sort: 'Sort',
      },
      valueMappings: {
        title: 'Value mappings',
        btn: 'Add',
        type: 'Type',
        type_tip: `
          <0>Default value: from=-Infinity; to=Infinity </0>
          <1>Null: match value is null or undefined or no data</1>
        `,
        type_map: {
          special: 'Fixed',
          range: 'Range',
          specialValue: 'Special',
        },
        text: 'Text',
        text_placeholder: 'Optional',
        color: 'Color',
        operations: '',
      },
    },
    standardOptions: {
      title: 'Standard options',
      unit: 'Unit',
      unit_tip: 'The default is SI Prefixes, setting to none will be disable the default process',
      datetime: 'Date format',
      min: 'Min',
      max: 'Max',
      decimals: 'Decimals',
    },
    overrides: {
      matcher: 'Matcher',
    },
    custom: {
      title: 'Graph styles',
      calc: 'Calc',
      maxValue: 'Max',
      baseColor: 'Base color',
      serieWidth: 'Serie width',
      sortOrder: 'Order',
      textMode: 'Text mode',
      valueAndName: 'Value and name',
      value: 'Value',
      name: 'Name',
      background: 'Background',
      colorMode: 'Color mode',
      valueField: 'Value field',
      colSpan: 'Col span',
      textSize: {
        title: 'Title textsize',
        value: 'Value textsize',
      },
      colorRange: 'Color', // hexbin
      reverseColorOrder: 'Reverse color order', // hexbin
      colorDomainAuto: 'Color domain auto', // hexbin
      colorDomainAuto_tip: 'By default, the min max value is automatically taken from the series', // hexbin
      fontBackground: 'Font background', // hexbin
      detailName: 'Link name',
      detailUrl: 'Link addr',
      pie: {
        legengPosition: 'Legend position',
        max: 'Max',
        max_tip: 'Exceeded blocks are merged and displayed as other',
        donut: 'Donut',
        labelWithName: 'Label with name',
        labelWithValue: 'Label with metric value',
        detailName: 'Link name',
        detailUrl: 'Link addr',
      },
      table: {
        displayMode: 'Display mode',
        showHeader: 'Show header',
        seriesToRows: 'SeriesToRows',
        labelsOfSeriesToRows: 'LabelsOfSeriesToRows',
        labelValuesToRows: 'LabelValuesToRows',
        columns: 'Columns',
        aggrDimension: 'Aggr dimension',
        sortColumn: 'Sort column',
        sortOrder: 'Sort order',
      },
      text: {
        textColor: 'TextColor',
        bgColor: 'BgColor',
        textSize: 'TextSize',
        justifyContent: {
          name: 'Justify content',
          unset: 'Unset',
          flexStart: 'Flex start',
          center: 'Center',
          flexEnd: 'Flex end',
        },
        alignItems: {
          name: 'Align items',
          unset: 'Unset',
          flexStart: 'Flex start',
          center: 'Center',
          flexEnd: 'Flex end',
        },
        content: 'Content',
        content_placeholder: 'Markdown and HTML',
        content_tip: 'Markdown and HTML',
      },
      timeseries: {
        drawStyle: 'Draw style',
        lineInterpolation: 'Line interpolation',
        spanNulls: 'Span nulls',
        spanNulls_0: 'Always',
        spanNulls_1: 'Never',
        lineWidth: 'Line width',
        fillOpacity: 'Fill opacity',
        gradientMode: 'Gradient mode',
        gradientMode_opacity: 'Opacity',
        gradientMode_none: 'None',
        stack: 'Stack',
        stack_noraml: 'Normal',
        stack_off: 'Off',
      },
      iframe: {
        src: 'Src',
      },
    },
    inspect: {
      title: 'Inspect',
      query: 'Query',
      json: 'Panel JSON',
    },
  },
  export: {
    copy: 'Copy JSON content to clipboard',
  },
  query: {
    title: 'Query',
    transform: 'Transform',
    datasource_placeholder: 'Select datasource',
    datasource_msg: 'Please select datasource',
    prometheus: {
      time: 'Time',
      time_tip: 'Default is the global time range of the dashboard',
    },
  },
  detail: {
    datasource_empty: 'Please configure the data source first',
    invalidTimeRange: 'Invalid __from and __to values',
    invalidDatasource: 'Invalid datasource',
    fullscreen: {
      notification: {
        esc: 'Press ESC to exit full screen mode',
        theme: 'Theme',
      },
    },
  },
};
export default en_US;

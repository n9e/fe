const en_US = {
  title: 'Dashboards',
  list: 'Dashboards',
  back_icon_tip: 'Move back one page in the session history. If there is no previous page, return to the dashboards',
  back_icon_tip_is_built_in: 'Move back one page in the session history. If there is no previous page, return to the built-in components',
  name: 'Name',
  tags: 'Tags',
  ident: 'Ident',
  ident_msg: 'Only letters, numbers, and hyphens are allowed',
  search_placeholder: 'Search',
  empty_guide: {
    title: 'No dashboard yet',
    desc: 'Create a dashboard, or import a built-in dashboard template with one click.',
    from_template: 'Import from template',
  },
  refresh_tip: 'A refresh interval smaller than the step ({{num}}s) will not update data',
  refresh_btn: 'Refresh',
  share_btn: 'Share',
  export_btn: 'Export (CSV)',
  clear_cache_btn: 'Clear cache',
  clear_cache_btn_tip: 'Clear the table column width cache; takes effect after refreshing the page',
  inspect_btn: 'Inspect',
  table_upgrade: {
    switch_title: 'Upgrade to TableNG',
    switch_content: 'Automatically migrate the legacy Table configuration?',
    auto_upgrade: 'Auto upgrade',
    switch_only: 'Switch type only',
  },
  public: {
    name: 'Public',
    unpublic: 'Not public',
    public_cate: 'Type',
    cate: {
      0: 'Anonymous access',
      1: 'Login access',
      2: 'Authorized access',
    },
    bgids: 'Authorized business groups',
    theme_link: {
      dark: 'Dark theme',
      light: 'Light theme',
    },
  },
  sharing_link: {
    title: 'Generate sharing link',
    title_anonymous: 'Sharing link (anonymous access)',
    allow_anonymous: 'Allow anonymous access without login',
    expire_at: 'Expiration',
    theme: 'Theme',
    theme_default: 'System',
    theme_dark: 'Dark',
    theme_light: 'Light',
    note: 'Note',
    note_placeholder: 'Note (required), e.g. for customer review',
    generate: 'Generate link',
    link: 'Sharing link',
    expire_time: 'Expires at',
    expired: 'expired',
    create_by: 'Created by',
    revoke: 'Revoke',
    revoke_confirm: 'The link stops working immediately after revoking. Continue?',
    revoked: 'Revoked',
    anonymous_tip: 'Anyone with the link can view this dashboard and query its referenced datasources until the link expires. Share with care',
    recommend_tip:
      'Anonymous access works through the link below: anyone with it can view this dashboard without logging in until it expires. For long-term exposure, set the expiration in years',
    unit_hour: 'Hour(s)',
    unit_day: 'Day(s)',
    unit_month: 'Month(s)',
    unit_year: 'Year(s)',
    fetch_failed: 'Failed to load sharing links',
    generate_failed: 'Failed to generate sharing link',
    revoke_failed: 'Failed to revoke sharing link',
    config_load_failed: 'Could not read the dashboard config, so anonymous access cannot be set up right now. Please close and retry',
    revoke_all_confirm_title: 'Revoke all sharing links?',
    revoke_all_confirm_content:
      'This dashboard still has {{num}} sharing link(s) that have not expired. A link stays valid regardless of the public settings, so after switching to this type it can still open the dashboard without logging in. Confirming revokes every sharing link on this dashboard and then saves the settings. Revoking cannot be undone.',
    revoke_all_ok: 'Revoke and save',
    revoke_all_check_failed:
      'Could not check whether this dashboard still has sharing links. The public settings were saved - please open the sharing link dialog and check manually',
  },
  default_filter: {
    title: 'Preset filters',
    public: 'Public dashboards',
    all: 'My business group dashboards',
    all_tip: 'Show dashboards from all my business groups',
  },
  create_title: 'Create dashboard',
  edit_title: 'Edit dashboard',
  add_panel: 'Add panel',
  cluster: 'Cluster',
  full_screen: 'Full screen',
  exit_full_screen: 'Exit full screen',
  copyPanelTip: 'Panel config copied. Click "Add panel" > "Paste panel" to paste the config JSON to create a panel',
  batch: {
    import: 'Import Nightingale dashboard JSON',
    label: 'Dashboard JSON',
    import_grafana: 'Import Grafana dashboard (not recommended)',
    import_grafana_tip: 'Only dashboards using Prometheus data sources, and the chart types and features supported by Nightingale, can be imported <a>feedback</a>',
    import_grafana_url: 'Import Grafana dashboard URL',
    import_grafana_url_label: 'Grafana dashboard URL',
    noSelected: 'Please select at least one dashboard',
    import_grafana_report: {
      title: 'Conversion report',
      panels: 'Panels',
      targets: 'Targets',
      variables: 'Variables',
      dropped: 'Dropped',
      unsupported: 'Unsupported items',
      unsupported_empty: 'No unsupported configuration was found',
      ledger: 'Migration ledger',
      schema: 'Schema version',
      status: 'Status',
      version: 'Version',
      reason: 'Reason',
      scope: 'Scope',
      path: 'Path',
      action: 'Action',
      confirm: 'Confirm import',
      back: 'Back to edit',
      copy: 'Copy Markdown report',
      copied: 'Report copied',
      convert_error: 'Conversion failed',
      save_error: 'Save failed',
    },
    import_builtin: 'Import built-in dashboard',
    import_builtin_board: 'Built-in dashboard',
    clone: {
      name: 'Name',
      result: 'Result',
      errmsg: 'Error message',
    },
  },
  link: {
    title: 'Links',
    name: 'Name',
    url: 'URL',
    isNewBlank: 'Open in new tab',
    dashboardIds_placeholder: 'Select dashboards',
  },
  var: {
    vars: 'Variables',
    btn: 'Add variable',
    title: {
      list: 'Variables',
      add: 'Add variable',
      edit: 'Edit variable',
    },
    name: 'Name',
    name_msg: 'Only letters, numbers, and underscores are allowed',
    name_repeat_msg: 'Variable name already exists',
    label: 'Label',
    type: 'Type',
    type_map: {
      query: 'Query',
      custom: 'Custom',
      textbox: 'Text box',
      constant: 'Constant',
      datasource: 'Data source',
      datasourceIdentifier: 'Data source identifier',
      hostIdent: 'Host ident',
    },
    hide: 'Hide',
    hide_map: {
      yes: 'Yes',
      no: 'No',
    },
    definition: 'Definition',
    definition_msg1: 'Please enter variable definition',
    definition_msg2: 'Variable definition must be valid JSON',
    reg: 'Regex',
    reg_tip: 'Optional, can filter options using a <a>regular expression literal</a>, which consists of a pattern enclosed between slashes',
    reg_tip2: 'If you want to extract a part of the options, <a>named capture groups can be used to separate display text and value</a>',
    multi: 'Multi select',
    allOption: 'Include all option',
    allValue: 'Custom all value',
    width: 'Width',
    width_tip: 'Set the width of the variable selector. Leave empty to use the default 180px.',
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
      definition: 'Data source type',
      defaultValue: 'Default value',
      regex: 'Data source name filter',
      regex_tip: 'Optional. Filter options using a <a>regular expression literal</a>, which consists of a pattern enclosed between slashes',
    },
    hostIdent: {
      invalid: 'The host ident variable requires authorized access; the dashboard will fail to load in anonymous access mode',
      invalid2: 'The dashboard has been configured with a host_ident variable and cannot be accessed anonymously',
    },
    help_tip: `
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
      \${__interval}: Time interval (seconds)
      <1 />
      \${__interval_ms}: Time interval (milliseconds)
      <1 />
      \${__range}: Time range (seconds)
      <1 />
      \${__range_ms}: Time range (milliseconds)
      <1 />
      \${__rate_interval}: Time interval (seconds), __interval * 4
      <1 />
      \${__from}: Unix millisecond
      <1 />
      \${__from_date_seconds}: Unix seconds epoch
      <1 />
      \${__from_date_iso}: ISO 8601/RFC 3339
      <1 />
      The syntax above also works with \${__to}
    `,
    help_tip_table_ng: `
      Variables usage
      <br />
      \${variable_name}: dashboard variable value
      <br />
      \${__row.column_name}: row data column value
      <br />
      \${__interval}: Time interval (seconds)
      <br />
      \${__interval_ms}: Time interval (milliseconds)
      <br />
      \${__range}: Time range (seconds)
      <br />
      \${__range_ms}: Time range (milliseconds)
      <br />
      \${__rate_interval}: Time interval (seconds), __interval * 4
      <br />
      \${__from}: Unix millisecond
      <br />
      \${__from_date_seconds}: Unix seconds epoch
      <br />
      \${__from_date_iso}: ISO 8601/RFC 3339
      <br />
      The syntax above also works with \${__to}
    `,
  },
  row: {
    edit_title: 'Edit row',
    delete_title: 'Delete row',
    name: 'Name',
    delete_confirm: 'Are you sure you want to delete this row?',
    cancel: 'Cancel',
    ok: 'Delete row and panels',
    ok2: 'Delete row',
    panels: '{{count}} panel',
    panels_plural: '{{count}} panels',
  },
  panel: {
    title: {
      add: 'Add panel',
      edit: 'Edit panel',
    },
    base: {
      title: 'Panel options',
      name: 'Title',
      name_tip: 'Table panels must have a title',
      link: {
        label: 'Links',
        label_tip: `
          Variables usage<br />
          \${variable_name}: dashboard variable value
        `,
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
        variance: 'Variance',
        stdDev: 'StdDev',
        series: 'Series',
        seriesFilter: 'Filter series',
        columns: 'Columns',
        none: 'none',
        behaviour: {
          label: 'Click behavior',
          showItem: 'Show item',
          hideItem: 'Hide item',
        },
        selectMode: {
          label: 'Select mode',
          single: 'Single',
          multiple: 'Multiple',
        },
        heightInPercentage: 'Height in percentage',
        sortBy: 'Sort column',
        sortBy_tip: 'Select a statistic column to sort by. Leave empty to keep original order',
        sortDir: 'Sort direction',
        sortDirAsc: 'Ascending',
        sortDirDesc: 'Descending',
        heightInPercentage_tip: 'Maximum height of the legend as a percentage of the panel, between 20% and 80%',
        widthInPercentage: 'Width in percentage',
        widthInPercentage_tip: 'Maximum width of the legend as a percentage of the panel, between 20% and 80%',
      },
      thresholds: {
        title: 'Thresholds',
        btn: 'Add threshold',
        mode: {
          label: 'Mode',
          tip: 'Percentage mode formula: Y-axis min + (Y-axis max - Y-axis min) * (percentage / 100)',
          absolute: 'Absolute',
          percentage: 'Percentage',
        },
      },
      thresholdsStyle: {
        label: 'Thresholds style',
        off: 'Off',
        line: 'Line',
        dashed: 'Dashed',
        'line+area': 'Line+Area',
        'dashed+area': 'Dashed+Area',
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
          special: 'Number',
          textValue: 'Text',
          range: 'Range',
          specialValue: 'Special',
        },
        value_placeholder: 'Match value',
        text: 'Text',
        text_placeholder: 'Optional',
        color: 'Color',
        operations: '',
      },
      colors: {
        name: 'Colors',
        scheme: 'Color scheme',
        reverse: 'Reverse colors',
      },
      links: {
        label: 'Links',
        add_btn: 'Add link',
        edit_btn: 'Edit link',
        title: 'Link title',
        title_required: 'Link title is required',
        url: 'Link URL',
        url_required: 'Link URL is required',
        target_blank: 'Open in new window',
      },
    },
    standardOptions: {
      title: 'Standard options',
      unit: 'Unit',
      unit_tip: 'The default is SI prefixes; setting None disables the default processing',
      datetime: 'Date format',
      min: 'Min',
      max: 'Max',
      decimals: 'Decimals',
      displayName: 'Display name',
      displayName_tip: 'Change the series name',
    },
    overrides: {
      columnWidth: 'Column width',
      matcher: {
        id: 'Matcher',
        byFrameRefID: {
          option: 'By query condition name',
          name: 'Query condition name',
        },
        byName: {
          option: 'By field name',
          name: 'Field name',
        },
      },
    },
    custom: {
      title: 'Graph styles',
      calc: 'Calc',
      calc_tip: 'Time series data requires value calculation for all time point data. Non-time series data ignores this setting',
      maxValue: 'Max',
      baseColor: 'Base color',
      serieWidth: 'Name width',
      sortOrder: 'Order',
      textMode: 'Text mode',
      valueAndName: 'Value and name',
      value: 'Value',
      name: 'Name',
      background: 'Background',
      colorMode: 'Color mode',
      valueField: 'Value field',
      valueField_tip: 'Value is a reserved keyword, used as the field name after time series data value calculation',
      valueField_tip2: 'You need to select a column whose value is a numeric type',
      nameField: 'Name field',
      nameField_tip: 'Use the value of the name field as the name of the series',
      colSpan: 'Col span',
      colSpanTip: 'Deprecated soon, selecting the "Auto" option will use the layout direction settings below',
      colSpanAuto: 'Auto',
      textSize: {
        title: 'Title font size',
        value: 'Value font size',
      },
      colorRange: 'Color', // hexbin
      reverseColorOrder: 'Reverse color order', // hexbin
      colorDomainAuto: 'Color domain auto', // hexbin
      colorDomainAuto_tip: 'By default, the min and max values are taken from the series automatically', // hexbin
      fontBackground: 'Font background', // hexbin
      detailName: 'Link name',
      detailUrl: 'Link URL',
      stat: {
        graphMode: 'Graph mode',
        none: 'None',
        area: 'Mini graph',
        orientation: 'Orientation',
        orientationTip: 'Selecting "Auto" will automatically select the layout direction based on the width and height of the chart.',
        orientationValueMap: {
          auto: 'Auto',
          vertical: 'Vertical',
          horizontal: 'Horizontal',
        },
      },
      pie: {
        countOfValueField: 'Count of value field',
        countOfValueField_tip: 'Count the number of values in the value field',
        legengPosition: 'Legend position',
        max: 'Max',
        max_tip: 'Slices beyond the limit are merged into "Other"',
        donut: 'Donut',
        labelWithName: 'Label with name',
        labelWithValue: 'Label with metric value',
        detailName: 'Link name',
        detailUrl: 'Link URL',
      },
      table: {
        displayMode: 'Display mode',
        showHeader: 'Show header',
        seriesToRows: 'Series to rows',
        labelsOfSeriesToRows: 'Labels of series to rows',
        labelValuesToRows: 'Label values to rows',
        columns: 'Columns',
        aggrDimension: 'Aggregation dimension',
        sortColumn: 'Sort column',
        sortOrder: 'Sort order',
        link: {
          mode: 'Link mode',
          cellLink: 'Cell link',
          appendLinkColumn: 'Append link column',
        },
        tableLayout: {
          label: 'Table layout',
          label_tip:
            'With fixed layout, the width is divided equally among the columns and no horizontal scrollbar appears. With auto layout, the default maximum column width is 150px, and overflowing content may produce a horizontal scrollbar.',
          auto: 'Auto',
          fixed: 'Fixed',
        },
        nowrap: 'No wrap',
        organizeFields: 'Organize fields',
        colorMode_tip:
          'Color mode is the color setting for the "value field". In value mode, the color is applied to the value text; in background mode, the color is applied to the background color of the cell where the field is located.',
        pageLimit: 'Page limit',
      },
      tableNG: {
        enablePagination: 'Enable pagination',
        showHeader: 'Show header',
        filterable: 'Enable column filter',
        sortColumn: 'Sort column',
        sortOrder: 'Sort order',
        enableRowDetail: 'Enable row details',
        enableRowDetail_tip:
          'When enabled, a details icon appears in the first column. Click it to view all fields and values for the row in a drawer, with row and field copy actions.',
        rowDetail: {
          triggerTip: 'View row details',
          title: 'Details',
          tableTab: 'Table',
          jsonTab: 'JSON',
          field: 'Field',
          value: 'Value',
          copyRow: 'Copy row',
          copyFieldAndValue: 'Copy field and value',
          copyFieldValue: 'Copy field value',
        },
        cellOptions: {
          type: {
            label: 'Cell type',
            options: {
              none: 'Default',
              'color-text': 'Color text',
              'color-background': 'Color background',
              gauge: 'Gauge',
            },
          },
          wrapText: 'Wrap text',
          wrapText_tip:
            'Enabling this will automatically wrap text in the cell and adjust the row height based on the number of text lines. If the row data volume is large, it may affect performance.',
          'color-background': {
            mode: {
              label: 'Color mode',
              options: {
                basic: 'Basic',
                gradient: 'Gradient',
              },
            },
          },
          gauge: {
            mode: {
              label: 'Mode',
              options: {
                basic: 'Basic',
                gradient: 'Gradient',
                lcd: 'LCD',
              },
            },
            valueDisplayMode: {
              label: 'Value display',
              options: {
                color: 'Color',
                text: 'Text',
                hidden: 'Hidden',
              },
            },
          },
        },
      },
      text: {
        textColor: 'Text color',
        textDarkColor: 'Text color (dark mode)',
        bgColor: 'Background color',
        textSize: 'Text size',
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
        stack_normal: 'Normal',
        stack_off: 'Off',
        yAxis: {
          title: 'Y-Axis settings',
          rightYAxis: {
            label: 'Right Y-Axis',
            normal: 'On',
            off: 'Off',
          },
        },
        showPoints: 'Show points',
        showPoints_always: 'Always',
        showPoints_none: 'None',
        pointSize: 'Point size',
      },
      iframe: {
        src: 'Src',
      },
      heatmap: {
        xAxisField: 'X-Axis',
        yAxisField: 'Y-Axis',
        valueField: 'Value field',
      },
      barchart: {
        xAxisField: 'X-Axis',
        yAxisField: 'Y-Axis',
        colorField: 'Color by field',
        barMaxWidth: 'Bar max width',
        colorField_tip: 'Name is a reserved keyword, used as the field name of the series name',
      },
      barGauge: {
        topn: 'TopN',
        combine_other: 'Other',
        combine_other_tip: 'Series beyond the TopN limit are merged into the "Other" series',
        otherPosition: {
          label: 'Other position',
          tip: 'The position of the "Other" series',
          options: {
            none: 'None',
            top: 'Top',
            bottom: 'Bottom',
          },
        },
        displayMode: 'Display mode',
        valueMode: {
          label: 'Value display',
          color: 'Color',
          hidden: 'Hidden',
        },
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
    add_query_btn: 'Add query',
    add_expression_btn: 'Add expression',
    transform: 'Transform',
    datasource_placeholder: 'Select data source',
    datasource_msg: 'Please select a data source',
    time: 'Time',
    time_tip: 'Default is the global time range of the dashboard',
    es: {
      field_key_msg: 'Field key is required',
    },
    prometheus: {
      query: 'Query (PromQL)',
      maxDataPoints: {
        tip: 'The maximum number of points per series, default is panel width (default 240), calculate step = (end - start) / maxDataPoints',
        tip_2: 'The maximum number of points per series, default is panel width, calculate step = (end - start) / maxDataPoints',
      },
      minStep: {
        label: 'Min step',
        tip: 'Minimum step, default is 15, calculate step = max(step, minStep, safeStep), safeStep = (end - start) / 11000',
      },
      step: {
        tag_tip: 'Calculate step = max((end - start) / maxDataPoints, minStep, safeStep), safeStep = (end - start) / 11000',
      },
      instant: {
        label: 'Instant query',
        tip: 'Instant query for the current time',
      },
    },
    expression_placeholder: 'Math operations on one or more queries. Reference queries by ${refId}, e.g. $A, $B, $C. Example: $A + $B > 10',
    legend: 'Legend',
    legendTip: 'Series name override or template, {{hostname}} will be replaced with label value for hostname',
    legendTip2: 'Series name override or template, {{hostname}} will be replaced with label value for hostname, currently only effective under time series data',
    options: 'Query options',
    options_max_data_points: 'Max data points',
    options_max_data_points_tip: 'The maximum number of points per series, default is panel width (default 240), calculate step = (end - start) / maxDataPoints',
    options_time: 'Time',
    options_time_tip: 'Specify a custom time range for the query, leave blank to use the dashboard time range',
    copy_query: 'Copy query',
    mixed_datasource: 'Mixed datasource',
    hide_response: 'Hide response data',
  },
  migrate: {
    title: 'Migrate dashboard',
    close_and_dismiss: 'Close and do not remind again',
    batch_migrate: 'Batch migrate dashboards',
    migrate_current: 'Migrate current dashboard',
    desc_1: 'v6 no longer supports global Prometheus cluster switching; the new version achieves this by binding panels to a data source variable.',
    desc_2: 'The migration tool creates a data source variable and binds all panels that have no data source yet.',
  },
  detail: {
    ai_analysis: 'AI analysis',
    datasource_empty: 'Please configure the data source first',
    invalidTimeRange: 'Invalid __from and __to values',
    invalidDatasource: 'Invalid data source',
    invalidPanelConfig: 'Invalid panel configuration',
    deletePanel_confirm: 'Are you sure you want to delete the panel: {{name}}?',
    invalidPanelType: 'Invalid panel type',
    fullscreen: {
      notification: {
        esc: 'Press ESC to exit full screen mode',
        theme: 'Switch theme',
      },
    },
    saved: 'Dashboard saved',
    expired: "The dashboard has been modified by someone else. To avoid overwriting each other's changes, please refresh the dashboard to get the latest configuration and data",
    prompt: {
      title: 'Unsaved changes',
      message: 'Do you want to save your changes?',
      cancelText: 'Cancel',
      discardText: 'Discard',
      okText: 'Save',
    },
    importPanel: {
      invalidJSON: 'Invalid panel config JSON',
      placeholder: 'Paste panel config JSON here, you can get the panel config JSON by clicking "Copy" in the more actions of the panel',
    },
  },
  settings: {
    graphTooltip: {
      label: 'Graph tooltip',
      tip: 'Control tooltip behavior for all panels',
      default: 'Default',
      sharedCrosshair: 'Shared crosshair',
      sharedTooltip: 'Shared tooltip',
    },
    graphZoom: {
      label: 'Graph zoom',
      tip: 'Control zoom behavior for all panels',
      default: 'Default',
      updateTimeRange: 'Update time range',
    },
    save: 'Save dashboard',
  },
  visualizations: {
    timeseries: 'Time series',
    barchart: 'Bar chart',
    stat: 'Stat',
    table: 'Table',
    tableNG: 'Table NG (Beta)',
    pie: 'Pie chart',
    hexbin: 'Hexmap',
    barGauge: 'Bar gauge',
    text: 'Text',
    gauge: 'Gauge',
    heatmap: 'Heatmap',
    iframe: 'Iframe',
    row: 'Row',
    importPanel: 'Paste panel',
  },
  calcs: {
    lastNotNull: 'Last not null value',
    last: 'Last value',
    firstNotNull: 'First not null value',
    first: 'First value',
    min: 'Min',
    max: 'Max',
    avg: 'Avg',
    sum: 'Sum',
    count: 'Count',
    origin: 'Origin',
    variance: 'Variance',
    stdDev: 'Std dev',
  },
  annotation: {
    add: 'Add annotation',
    edit: 'Edit annotation',
    description: 'Description',
    tags: 'Tags',
    updated: 'Annotation updated',
    deleted: 'Annotation deleted',
  },
  transformations: {
    organize: {
      title: 'Organize fields by name',
      desc: 'Re-order, hide, or rename fields.',
    },
    merge: {
      title: 'Merge tables',
      desc: 'Merge multiple tables into one table by matching the values of the specified fields.',
    },
    joinByField: {
      title: 'Join by field',
      desc: 'Join multiple tables by matching the values of the specified fields.',
      mode: 'Mode',
      byField: 'Field',
    },
    timeSeriesTable: {
      title: 'Time series to table',
      desc: 'Merge the values of each time point of a series into a single value.',
      fieldName: 'Field',
      functions: 'Function',
    },
    groupedAggregateTable: {
      title: 'Grouped aggregate table',
      desc: 'Group the table by one or more fields and aggregate the other fields.',
      operation_map: {
        aggregate: 'Aggregate',
        groupby: 'Group by',
      },
    },
  },
  add_transformation: 'Add transformation',
};
export default en_US;

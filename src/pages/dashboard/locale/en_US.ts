const en_US = {
  title: 'Dashboards',
  list: 'Dashboards',
  back_icon_tip: 'Move back one page in the session history. If there is no previous page, return to the dashboards',
  back_icon_tip_is_built_in: 'Move back one page in the session history. If there is no previous page, return to the built-in components',
  name: 'Name',
  tags: 'Tags',
  ident: 'Ident',
  ident_msg: 'Please enter English letters or numbers or hyphens',
  search_placeholder: 'Search',
  refresh_tip: 'Refresh interval less than step({{num}}s) will not update data',
  refresh_btn: 'Refresh',
  share_btn: 'Share',
  export_btn: 'Export (CSV)',
  clear_cache_btn: 'Clear cache',
  clear_cache_btn_tip: 'Clear the table column width cache, take effect after refreshing the page',
  inspect_btn: 'Inspect',
  public: {
    name: 'Public',
    unpublic: 'Unpublic',
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
  default_filter: {
    title: 'Preset filters',
    public: 'Public dashboards',
    all: 'My business groups dashboards',
    all_tip: 'Display all my business groups dashboards',
  },
  create_title: 'Create dashboard',
  edit_title: 'Edit dashboard',
  add_panel: 'Add panel',
  cluster: 'Cluster',
  full_screen: 'Full screen',
  exit_full_screen: 'Exit full screen',
  copyPanelTip: 'Panel copied. Click "Add panel" to paste.',
  batch: {
    import: 'Import dashboard JSON',
    label: 'Dashboard JSON',
    import_grafana: 'Import Grafana dashboard',
    import_grafana_tip: 'Imported panels only support the chart types and features that n9e currently supports, <a>feedback</a>',
    import_grafana_tip_version_error: 'Import of dashboard config less than v7 version is not supported',
    import_grafana_tip_version_warning: 'The imported dashboard config version is less than v8, some panels may not be displayed properly, do you want to continue importing?',
    import_grafana_url: 'Import Grafana dashboard URL',
    import_grafana_url_label: 'Grafana dashboard URL',
    continueToImport: 'Continue to import',
    noSelected: 'Please select any dashboard',
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
    name_msg: 'Only support number and character underline',
    name_repeat_msg: 'Variable name already exists',
    label: 'Label',
    type: 'Type',
    type_map: {
      query: 'Query',
      custom: 'Custom',
      textbox: 'Text box',
      constant: 'Constant',
      datasource: 'Datasource',
      hostIdent: 'Host ident',
      businessGroupIdent: 'Business group ident',
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
    reg_tip: 'Optional, can filter options or extract values by regex。Using a <a>regular expression literal</a>, which consists of a pattern enclosed between slashes',
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
      regex_tip: 'Optional, can filter options, Using a <a>regular expression literal</a>, which consists of a pattern enclosed between slashes',
    },
    businessGroupIdent: {
      ident: 'Business group ident',
      invalid: 'Invalid business group ident, Please go to the business group management settings first.',
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
  },
  row: {
    edit_title: 'Edit row',
    delete_title: 'Delete row',
    name: 'Name',
    delete_confirm: 'Confirm to delete row?',
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
        behaviour: {
          label: 'Behavior triggered by click',
          showItem: 'Show item',
          hideItem: 'Hide item',
        },
        selectMode: {
          label: 'Select mode',
          single: 'Single',
          multiple: 'Multiple',
        },
        heightInPercentage: 'Height in percentage',
        heightInPercentage_tip: 'Legend height occupies the maximum height percentage of the panel, the minimum value is 20%, the maximum value is 80%',
        widthInPercentage: 'Width in percentage',
        widthInPercentage_tip: 'Legend width occupies the maximum width percentage of the panel, the minimum value is 20%, the maximum value is 80%',
      },
      thresholds: {
        title: 'Thresholds',
        btn: 'Add threshold',
        mode: {
          label: 'Mode',
          tip: 'Percent mode calculation formula Y-axis minimum value + (Y-axis maximum value - Y-axis minimum value) * (percentage value / 100)',
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
    },
    standardOptions: {
      title: 'Standard options',
      unit: 'Unit',
      unit_tip: 'The default is SI Prefixes, setting to none will be disable the default process',
      datetime: 'Date format',
      min: 'Min',
      max: 'Max',
      decimals: 'Decimals',
      displayName: 'Display name',
      displayName_tip: 'Change the series name',
    },
    overrides: {
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
        link: {
          mode: 'Link mode',
          cellLink: 'Cell link',
          appendLinkColumn: 'Append link column',
        },
        tableLayout: {
          label: 'Table layout',
          label_tip:
            'Fixed layout following default width divided equally by the number of columns will not produce horizontal scrollbars. The default maximum width under Auto Layout is 150px and table content may overflow resulting in horizontal scroll bars.',
          auto: 'Auto',
          fixed: 'Fixed',
        },
        nowrap: 'No wrap',
        organizeFields: 'Organize fields',
        colorMode_tip:
          'Color mode is the color setting for the "value field". In value mode, the color is applied to the value text; in background mode, the color is applied to the background color of the cell where the field is located.',
        pageLimit: 'Page limit',
      },
      text: {
        textColor: 'TextColor',
        textDarkColor: 'TextDarkColor',
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
        yAxis: {
          title: 'Y-Axis settings',
          rightYAxis: {
            label: 'Right Y-Axis',
            noraml: 'On',
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
        combine_other_tip: 'The number of series that exceed the topN value will be merged into the "Other" series',
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
    transform: 'Transform',
    datasource_placeholder: 'Select datasource',
    datasource_msg: 'Please select datasource',
    time: 'Time',
    time_tip: 'Default is the global time range of the dashboard',
    prometheus: {
      maxDataPoints: {
        tip: 'Maximum number of points per series, Calculation step = (end - start) / maxDataPoints, default value is 240 step = 15s in the last 1 hour',
      },
      minStep: {
        tip: 'An additional lower limit for the step parameter of the Prometheus query, Calculate step = max(step, minStep, safeStep), safeStep = (end - start) / 11000',
      },
      step: {
        tag_tip: 'Calculate step = max((end - start) / maxDataPoints, minStep, safeStep), safeStep = (end - start) / 11000',
      },
    },
    expression_placeholder: 'Math operations on one or more queries. You reference the query by ${refId} ie. $A, $B, $C etc. The sum of two scalar values: $A + $B > 10',
    legendTip: 'Series name override or template, {{hostname}} will be replaced with label value for hostname',
    legendTip2: 'Series name override or template, {{hostname}} will be replaced with label value for hostname, currently only effective under time series data',
  },
  detail: {
    datasource_empty: 'Please configure the data source first',
    invalidTimeRange: 'Invalid __from and __to values',
    invalidDatasource: 'Invalid datasource',
    fullscreen: {
      notification: {
        esc: 'Press ESC to exit full screen mode',
        theme: 'Switch theme',
      },
    },
    saved: 'Dashboard saved',
    expired: 'The dashboard has been modified by others. To avoid overwriting each other, please refresh the dashboard to view the latest configuration and data',
    prompt: {
      title: 'Unsaved changes',
      message: 'Do you want to save your changes?',
      cancelText: 'Cancel',
      discardText: 'Discard',
      okText: 'Save',
    },
    noPanelToPaste: 'No panel to paste',
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
    timeseries: 'Time Series',
    barchart: 'Bar Chart',
    stat: 'Stat',
    table: 'Table',
    pie: 'Pie Chart',
    hexbin: 'Hexmap',
    barGauge: 'Bar Gauge',
    text: 'Text',
    gauge: 'Gauge',
    heatmap: 'Heatmap',
    iframe: 'Iframe',
    row: 'Row',
    pastePanel: 'Paste panel',
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
  },
  annotation: {
    add: 'Add annotation',
    edit: 'Edit annotation',
    description: 'Description',
    tags: 'Tags',
    updated: 'Annotation updated',
    deleted: 'Annotation deleted',
  },
};
export default en_US;

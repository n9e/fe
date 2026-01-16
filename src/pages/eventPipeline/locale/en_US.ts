const en_US = {
  title: 'Workflow',
  title_add: 'Add workflow',
  title_edit: 'Edit workflow',
  teams: 'Authorized teams',
  teams_tip:
    'Limit which team members can view and modify this configuration. Multiple teams can be associated<br />For example: If the configuration is authorized to the infra-team, only members of the infra-team can access or adjust this configuration.',
  basic_configuration: 'Basic configuration',
  filter_enable: 'Filter conditions',
  label_filters: 'Applicable labels',
  label_filters_tip:
    'Set the tag filter condition for event processing. Events will be processed only when they contain tags that match the configuration here. <br /> Example: Fill in service=mon, which means that only when an event contains the tag service=mon will it enter this processing flow.',
  attribute_filters: 'Applicable attributes',
  attribute_filters_tip:
    'Set the attribute filtering conditions for event processing. Events will be processed only when they contain attributes that match the configuration here. <br /> Example: Fill in Business Group == DefaultBusiGroup, which means that only when the "Business Group" attribute of the event is DefaultBusiGroup, will the processing flow be entered.',
  attribute_filters_value: 'Attribute value',
  attribute_filters_options: {
    group_name: 'Business group',
    cluster: 'Data source',
    is_recovered: 'Is recovered?',
  },
  processor: {
    title: 'Processor',
    add_btn: 'Add processor',
    typ: 'Type',
    help_btn: 'Help',
  },
  label_enrich: {
    label_source_type: {
      label: 'Label source',
      options: {
        built_in_mapping: 'Built-in mapping',
      },
    },
    label_mapping_id: 'Label mapping name',
    help: 'Use the label specified in the source label to query the mapping, and append the fields queried from the mapping to the alarm event according to the "Add label" configuration',
    source_keys: {
      label: 'Source label',
      text: 'The field in the mapping <strong>{{field}}</strong> corresponds to the label in the event',
      target_key_placeholder: 'Label key',
      target_key_required: 'Label key cannot be empty',
    },
    append_keys: {
      label: 'Add label',
      source_key_placeholder: 'Field in the mapping',
      rename_key: 'Rename label Key',
      target_key_placeholder: 'Label Key',
    },
  },
  test_modal: {
    title: {
      settings: 'Select event',
      result: 'Event preview',
    },
  },
  callback: {
    url: 'URL',
    advanced_settings: 'Advanced settings',
    basic_auth_user: 'Authorization user name',
    basic_auth_user_placeholder: 'Please enter the authorization user name',
    basic_auth_pass: 'Authorization password',
    basic_auth_pass_placeholder: 'Please enter the authorization password',
  },
  event_drop: {
    content: 'Judgment logic',
    content_placeholder: 'Use go template syntax. If the final result is true, the event will be dropped at this stage.',
  },
  ai_summary: {
    url_placeholder: 'Please enter the API service address',
    url_required: 'Please enter the URL',
    api_key_placeholder: 'API Key',
    api_key_required: 'Please enter the API Key',
    model_name: 'Model Name',
    model_name_placeholder: 'e.g. deepseek-chat',
    model_name_required: 'Please enter the model name',
    prompt_template: 'Prompt Template',
    prompt_template_required: 'Please enter the prompt template',
    advanced_config: 'Advanced Configuration',
    custom_params: 'AI Model Parameter Configuration',
    custom_params_key_label: 'Parameter Name (e.g. temperature)',
    custom_params_value_label: 'Parameter Value (e.g. 0.7)',
    proxy_placeholder: 'e.g. http://proxy.example.com:8080',
    timeout_placeholder: 'Timeout (seconds)',
    timeout_required: 'Please enter the timeout',
    url_tip: `- **Description**: API endpoint address of the AI service\n- **Example**: \`https://api.deepseek.com/v1/chat/completions\``,
    api_key_tip: `- **Description**: API key provided by the AI service provider\n- **How to get**:\n  - OpenAI: Apply on the OpenAI website\n  - DeepSeek: Register and get it on the DeepSeek website`,
    model_name_tip: `- **Description**: Specify the AI model name to use\n- **Common models**:\n  - \`gpt-3.5-turbo\` (OpenAI)\n  - \`gpt-4\` (OpenAI)\n  - \`deepseek-chat\` (DeepSeek)`,
    prompt_template_tip: `The prompt template is the core of AI analysis. You can use {{$event}} to reference each field of the event. For detailed event structure, refer to the [alert history table](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/schema/alert_his_event/). You can start with the provided default template.`,
    custom_params_tip: `- AI Model Parameter Configuration\n\nUsed to fine-tune the behavior of the AI model:\n\n| Name        | Description         | Recommended | Example |\n| ----------- | ------------------- | ----------- | ------- |\n| temperature | Controls randomness | 0.3-0.7     | 0.7     |\n| max_tokens  | Max output tokens   | 200-500     | 300     |\n| top_p       | Sampling threshold  | 0.8-1.0     | 0.9     |\n\n**How to configure**:\n1. Click the + button next to \"Custom Params\"\n2. Enter the parameter name (e.g. temperature)\n3. Enter the parameter value (e.g. 0.7)`,
    prompt_template_placeholder: `Please analyze the following alert event information and provide a concise summary:
Alert Rule: {{$event.RuleName}}
Severity: {{$event.Severity}}
Alert Status: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}
Trigger Time: {{$event.TriggerTime}} 
Trigger Value: {{$event.TriggerValue}}
Rule Note: {{$event.RuleNote}}
Tags: {{$event.Tags}}
Annotations: {{$event.Annotations}}

Please provide a summary within 100 characters, focusing on:
1. What system/service had what problem
2. Severity of the problem
3. Possible impact
4. Simple handling suggestion
The summary should be concise and help O&M staff quickly understand the alert situation.`,
  },
  script: {
    timeout: 'Timeout (ms)',
    timeout_tooltip: 'The maximum execution time of the script, exceeding which will terminate the script',
    timeout_placeholder: 'Please enter the timeout',
    content: 'Script content',
    content_tooltip: 'Write a script to process events, events will be passed to the script as a JSON object, the script must output a JSON object to stdout',
    content_placeholder: 'Please enter the script content',
  },
  inhibit: {
    help: 'Event inhibition processor. When an alert is sent, it prevents notifications for another alert event, reducing notifications. Common scenario: When there is an active P1 level fault in the same alert rule, ignore P2 and P3 level alert notifications. For more information, refer to <a>documentation</a>',
    tip1: 'When <b>new alert</b> meets the following conditions',
    tip2: 'and',
    tip3: 'seconds there are <b>active alerts</b> that meet the following conditions',
    tip4: 'and <b>new alert</b> and <b>active alert</b> have the following same items',
    tip5: 'When all the above conditions are met, the current alert will be suppressed and no further notifications will be sent',
    duration_required: 'Inhibition duration cannot be empty',
    duration_max: 'Inhibition duration cannot exceed 600 seconds',
    match_label_keys: 'Labels',
    match_label_keys_required: 'Labels cannot be empty',
    match_attribute_keys: 'Attributes',
    match_attribute_keys_required: 'Attributes cannot be empty',
    keys_at_least_one_required: 'At least one label or attribute is required',
    preview:
      'Rule preview: When "<b>New alert: {{newAlertLabelsAttrs}}</b>" and there exists "<b>Active alert: {{activeAlertLabelsAttrs}}</b>" within the past "<b>{{duration}} seconds</b>", and both are the same in "<b>{{matchLabelsAttrs}}</b>", suppress notifications for the new alert.',
    labels_filter: {
      label: 'Labels',
      label_tip:
        'Only suppress alert events that meet these label matching conditions, used to narrow the impact scope. Not configured means no restrictions. Supports dropdown selection of existing label keys (recommended) or manual input',
      label_placeholder: 'Enter or select label keys for matching, such as app / cluster / alertname',
    },
    labels_filter_value_placeholder: 'Manually enter or select label values for matching',
    attributes_filter: {
      label: 'Attributes',
      label_tip: 'Limit the suppression scope by event attributes: only alerts that simultaneously match these attributes will be suppressed; leave empty to apply to all alerts',
    },
    active_event_labels_filter: {
      label: 'Labels',
      label_tip: `**Used to limit the scope of active alerts**
- Not configured: means not using labels for filtering
- Configured: can select existing label keys from the dropdown list (recommended), or manually enter label keys. Only when active alerts simultaneously meet these label conditions will they enter the filtering scope.

Example: Fill in service=mon, which means only when an event contains the label service=mon will it participate in the subsequent inhibition logic.`,
    },
    active_event_attributes_filter: {
      label: 'Attributes',
      label_tip: `**Used to limit the scope of active alerts**
- Not configured: means not using attributes for filtering
- Configured: only when active alerts simultaneously meet these attribute conditions will they be filtered out.

Example: Fill in Business Group==DefaultBusiGroup, which means only when the "Business Group" attribute of the active event is DefaultBusiGroup will it be filtered out for subsequent event inhibition processes`,
    },
  },
  inhibit_qd: {
    help: 'Suppress events based on query results: When an alert is triggered, the data query below will be executed; if at least one piece of data is returned, this alert will be suppressed (no notification); if no data is returned, normal notification will occur. For more information, see <a>documentation</a>',
    t_1: 'and query the following <b>data</b>',
  },
  annotation_qd: {
    help: 'Additional query processor is an alert enhancement method. When an alert is triggered, it can query related information from data sources, such as logs, and attach them to the alert. See <a>documentation</a> for details',
    query_configs: 'Data Query',
    use_event_datasource: 'Use alert event datasource',
    use_event_datasource_help: 'When enabled, only alert sample events that match the datasource type can be selected',
    datasource_cate_required: 'Datasource type cannot be empty',
    datasource_ids_required: 'Datasource cannot be empty',
    select_alert_event_btn: 'Select alert sample event',
    select_alert_event_tip: 'Select an alert sample event to render variables in the query statement and preview data',
    select_alert_event_label: 'Selected alert sample event',
    query_required: 'Query condition cannot be empty',
    sql_limit_valid: 'SQL query statement must contain LIMIT clause',
    annotation_configs: 'Data Append',
    annotation_configs_tip: 'Configure Key/Value to add query results to alert information',
    annotation_key_tip: 'Define the new field Key, it is recommended to use English letters',
    annotation_val_tip: 'New field Value template, refer to the documentation for syntax',
    annotation_key_placeholder: 'Annotation field name',
    annotation_val_placeholder: 'Annotation field content, supports template syntax to fill query results as variables',
    annotation_key_required: 'Annotation field name cannot be empty',
    annotation_val_required: 'Annotation field content cannot be empty',
    data_preview: 'Data Preview',
    data_preview_query: 'Query Statement',
    data_preview_no_eventid: 'Please select an alert event first',
    query_limit: 'Return limit',
  },
  event_recover: {
    help: 'Alert self-healing event processor. Used to execute shell scripts on machines when alerts are triggered, can be used to obtain relevant alert information or execute self-healing tasks。 <a>Documentation</a>',
    title: 'Alert Self-healing',
    create_btn: 'Create self-healing template',
    tpl_id: 'Self-healing template',
    tpl_id_required: 'Self-healing template cannot be empty',
    host: 'Target machine',
    host_placeholder: 'Can be left empty by default. If empty, the machine to be executed will be obtained from the ident label in the event',
    args: 'Parameters',
    args_tip: 'Parameters appended after the script, multiple parameters are separated by double comma,,, such as arg1,,arg2,,arg3',
    save_result: 'Save execution result',
    save_result_tip: 'Save the script execution result to the alert event',
    timeout: 'Execution wait time',
    timeout_tip: 'If the script cannot be completed within the wait time, the result will not be retrieved',
    timeout_max_warning: 'Execution wait time cannot exceed 60 seconds',
    select_host: 'Select target machine',
  },
};
export default en_US;

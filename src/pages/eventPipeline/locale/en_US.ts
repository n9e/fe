const en_US = {
  title: 'Event pieplines',
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
    prompt_template_tip: `The prompt template is the core of AI analysis. You can use {{$event}} to reference each field of the event. For detailed event structure, refer to the [alert history table](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/schema/alert_his_event/). You can start with the provided default template.`,
    custom_params_tip: `- AI Model Parameter Configuration\n\nUsed to fine-tune the behavior of the AI model:\n\n| Name        | Description         | Recommended | Example |\n| ----------- | ------------------- | ----------- | ------- |\n| temperature | Controls randomness | 0.3-0.7     | 0.7     |\n| max_tokens  | Max output tokens   | 200-500     | 300     |\n| top_p       | Sampling threshold  | 0.8-1.0     | 0.9     |\n\n**How to configure**:\n1. Click the + button next to \"Custom Params\"\n2. Enter the parameter name (e.g. temperature)\n3. Enter the parameter value (e.g. 0.7)`,
    prompt_template_placeholder: `Please analyze the following alert event information and provide a concise summary in Chinese:
Alert Rule: {{$event.RuleName}}
Severity: {{$event.Severity}}
Alert Status: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}
Trigger Time: {{$event.TriggerTime}} 
Host: {{$event.Host}}
Trigger Value: {{$event.Value}}
Rule Note: {{$event.RuleNote}}
Tags: {{$event.Tags}}
Annotations: {{$event.Annotations}}

Please provide a summary within 100 Chinese characters, focusing on:
1. What system/service had what problem
2. Severity of the problem
3. Possible impact
4. Simple handling suggestion
The summary should be concise and help O&M staff quickly understand the alert situation.`,
  },
};
export default en_US;

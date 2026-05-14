import _ from 'lodash';

export function processFormValues(values, selectedRules) {
  values = _.cloneDeep(values);
  const tags = values?.tags?.map((item) => {
    return {
      ...item,
      value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
    };
  });
  const busi_groups = values?.busi_groups?.map((item) => {
    return {
      ...item,
      value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
    };
  });

  return {
    ...values,
    tags,
    busi_groups,
    redefine_severity: values.redefine_severity ? 1 : 0,
    redefine_channels: values.redefine_channels ? 1 : 0,
    redefine_webhooks: values.redefine_webhooks ? 1 : 0,
    rule_ids: _.map(selectedRules, 'id'),
    user_group_ids: values.user_group_ids ? values.user_group_ids.join(' ') : '',
    new_channels: values.new_channels ? values.new_channels.join(' ') : '',
    cluster: '0',
  };
}

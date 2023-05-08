import _ from 'lodash';

export function processInitialValues(initialValues) {
  const enabled = initialValues.disabled === 0;
  const filtered = _.omit(initialValues, ['disabled', 'update_at', 'update_by', 'create_at', 'create_by']);
  return {
    ...filtered,
    enabled,
  };
}

export function processFormValues(formValues) {
  const disabled = formValues.enabled ? 0 : 1;
  const filtered = _.omit(formValues, ['enabled']);
  return {
    ...filtered,
    disabled,
  };
}

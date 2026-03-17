import { Item, FormValues } from '../types';

/**
 * 1. 将 extra_config 中的 custom_headers 从 Record<string, string> 转换为 { key: string; value: string }[] 以适配 Form.List
 * 2. 将 extra_config 中的 custom_params 从 Record<string, any> 转换为 string 以适配 Input.TextArea
 */
export function adjustFormValues(values: Item): FormValues {
  const adjustedValues = { ...values } as unknown as FormValues;

  if (values.extra_config?.custom_headers) {
    adjustedValues.extra_config = {
      ...adjustedValues.extra_config,
      custom_headers: Object.entries(values.extra_config.custom_headers).map(([key, value]) => ({ key, value })),
    };
  }

  if (values.extra_config?.custom_params) {
    adjustedValues.extra_config = {
      ...adjustedValues.extra_config,
      custom_params: JSON.stringify(values.extra_config.custom_params, null, 2),
    };
  }

  return adjustedValues;
}

export function adjustSubmitValues(values: FormValues): Item {
  const adjustedValues = { ...values } as unknown as Item;

  if (values.extra_config?.custom_headers) {
    adjustedValues.extra_config = {
      ...adjustedValues.extra_config,
      custom_headers: values.extra_config.custom_headers.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
    };
  }

  if (values.extra_config?.custom_params) {
    try {
      adjustedValues.extra_config = {
        ...adjustedValues.extra_config,
        custom_params: JSON.parse(values.extra_config.custom_params),
      };
    } catch (error) {
      console.warn('Invalid JSON in custom_params:', error);
      adjustedValues.extra_config = {
        ...adjustedValues.extra_config,
        custom_params: {},
      };
    }
  }

  return adjustedValues;
}

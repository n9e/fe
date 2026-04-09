import { Item, FormValues } from '../types';

export function adjustFormValues(values: Item): FormValues {
  const adjustedValues = { ...values } as unknown as FormValues;

  if (values.headers) {
    adjustedValues.headers = Object.entries(values.headers).map(([key, value]) => ({ key, value }));
  }

  return adjustedValues;
}

export function adjustSubmitValues(values: FormValues): Item {
  const adjustedValues = { ...values } as unknown as Item;

  if (values.headers) {
    adjustedValues.headers = values.headers.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  return adjustedValues;
}

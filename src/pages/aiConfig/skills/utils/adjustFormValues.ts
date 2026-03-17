import { Item, FormValues } from '../types';

export function adjustFormValues(values: Item): FormValues {
  const adjustedValues = { ...values } as unknown as FormValues;

  if (values.metadata) {
    adjustedValues.metadata = values.metadata.map(({ key, value }) => ({ key, value }));
  }

  return adjustedValues;
}

export function adjustSubmitValues(values: FormValues): Item {
  const adjustedValues = { ...values } as unknown as Item;

  if (values.metadata) {
    adjustedValues.metadata = values.metadata.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  return adjustedValues;
}

import { IS_PLUS } from '@/utils/constant';
// @ts-ignore
import {
  customRuleTypeOptions,
  isCustomRuleProd,
  getCustomProdDefaultValues,
  processCustomProdFormValues,
  processCustomProdInitialValues,
  getCustomProdUrlValues,
} from 'plus:/parcels/AlertRule/prods';

export const customProdOptions: { value: string; label: string; pro: boolean; logo?: string }[] = IS_PLUS ? customRuleTypeOptions : [];
export const isCustomProd = (prod?: string): boolean => IS_PLUS && isCustomRuleProd(prod);
export const customProdDefaults = (prod: string): any => (IS_PLUS ? getCustomProdDefaultValues(prod) : undefined);
export const customProdFormValues = (values: any): any => (isCustomProd(values.prod) ? processCustomProdFormValues(values) : values);
export const customProdInitialValues = (values: any): any => (isCustomProd(values.prod) ? processCustomProdInitialValues(values) : values);
export const customProdUrlValues = (search: string): any => (IS_PLUS ? getCustomProdUrlValues(search) : undefined);
export const customProdCates = () => customProdOptions.map((item) => ({ ...item, type: [item.value], alertRule: true, alertPro: true, logo: item.logo || '' }));
export const customProdLabel = (prod?: string): string | undefined => customProdOptions.find((item) => item.value === prod)?.label;

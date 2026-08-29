import { MODEL_GATEWAY_PLACEHOLDER } from '../constants';
import { Item } from '../types';

/**
 * 内置的模型网关配置，后端以占位值下发 api_url
 */
export function isBuiltinConfig(item?: Pick<Item, 'api_url'>) {
  return item?.api_url === MODEL_GATEWAY_PLACEHOLDER;
}

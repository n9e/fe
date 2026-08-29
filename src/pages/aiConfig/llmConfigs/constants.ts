export const NS = 'ai-config-llm-configs';
export const PATH = '/ai-config/llm-configs';
export const PERM = PATH;

/**
 * 内置模型网关配置的 api_url 占位值，后端不会下发真实地址
 * 前端据此判定该配置为内置配置：隐藏具体接入参数，仅展示为「内置」
 */
export const MODEL_GATEWAY_PLACEHOLDER = '__fc_model_gateway_placeholder__';

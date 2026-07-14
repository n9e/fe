import { Item, FormValues } from '../types';

export function adjustFormValues(values: Item): FormValues {
  const adjustedValues = { ...values } as unknown as FormValues;

  if (values.headers) {
    adjustedValues.headers = Object.entries(values.headers).map(([key, value]) => ({ key, value }));
  }

  // 兼容存量数据：auth_mode 缺省时按是否有 headers 推断
  if (!adjustedValues.auth_mode) {
    adjustedValues.auth_mode = values.headers && Object.keys(values.headers).length > 0 ? 'header' : 'none';
  }

  return adjustedValues;
}

export function adjustSubmitValues(values: FormValues, isAdmin = true): Item {
  const adjustedValues = { ...values } as unknown as Item;

  if (values.headers) {
    adjustedValues.headers = values.headers.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  // 仅 header 模式提交请求头；切到 none/oauth 后残留的头不应一起落库
  if (values.auth_mode !== 'header') {
    delete adjustedValues.headers;
  }

  // 非管理员只能创建/管理私有 MCP Server，强制 private=1（后端亦会强制）
  if (!isAdmin) {
    adjustedValues.private = 1;
  }

  return adjustedValues;
}

// stripOAuthFields 去掉仅用于 OAuth 授权流程的临时表单字段，避免随服务器主体一起提交。
export function stripOAuthFields<T extends Record<string, any>>(values: T): T {
  const out = { ...values };
  delete out.oauth_client_id;
  delete out.oauth_client_secret;
  delete out.oauth_scope;
  return out;
}

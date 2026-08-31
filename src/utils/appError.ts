export type AppErrorCode = 'PERMISSION_DENIED' | 'NOT_FOUND' | 'SERVICE_UNAVAILABLE';

export interface AppErrorResource {
  type: string;
  id?: string;
  name?: string;
}

export interface AppErrorOwner {
  username: string;
  nickname?: string;
}

/**
 * 错误的统一形状。
 *
 * 后端负责的部分（resource / owners / requiredPerm）都是可选的：缺了只是文案精度下降，
 * 不影响页面能不能渲染出来，所以前端不能假设它们一定存在。
 */
export interface AppError {
  isAppError: true;
  status: number;
  code?: AppErrorCode;
  message: string;
  /** 受限资源，由后端给 */
  resource?: AppErrorResource;
  /** 需要的权限点，由后端给，只在诊断信息里展示 */
  requiredPerm?: string;
  /** 可以授权的人，由后端给；缺失时前端回退到查询管理员列表 */
  owners?: AppErrorOwner[];
  /** 下面几项前端自己就能算出来，不需要后端每个接口都塞一遍 */
  path: string;
  from?: string;
  action?: string;
  occurredAt: number;
}

export function isAppError(error: any): error is AppError {
  return !!error && error.isAppError === true;
}

const STATUS_CODE_MAP: Record<number, AppErrorCode> = {
  403: 'PERMISSION_DENIED',
  404: 'NOT_FOUND',
};

function isPlainObject(value: any): boolean {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function resolveCode(status: number, raw?: any): AppErrorCode | undefined {
  if (typeof raw?.code === 'string') return raw.code as AppErrorCode;
  if (STATUS_CODE_MAP[status]) return STATUS_CODE_MAP[status];
  if (status >= 500 && status < 600) return 'SERVICE_UNAVAILABLE';
  return undefined;
}

export interface NormalizeErrorParams {
  status: number;
  message: string;
  /** 响应体，两种信封都能吃：{ error: {...} } 和 n9e 的 { err, dat } */
  data?: any;
  action?: string;
}

export function normalizeError({ status, message, data, action }: NormalizeErrorParams): AppError {
  const raw = isPlainObject(data?.error) ? data.error : undefined;
  return {
    isAppError: true,
    status,
    code: resolveCode(status, raw),
    message,
    resource: isPlainObject(raw?.resource) ? raw.resource : undefined,
    requiredPerm: typeof raw?.required_perm === 'string' ? raw.required_perm : undefined,
    owners: Array.isArray(raw?.owners) ? raw.owners : undefined,
    path: `${window.location.pathname}${window.location.search}`,
    from: document.referrer || undefined,
    action,
    occurredAt: Date.now(),
  };
}

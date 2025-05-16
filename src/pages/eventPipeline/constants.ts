export const NS = 'event-pipelines';
export const PERM = `/${NS}`;
export const DEFAULT_VALUES = {
  processors: [
    {
      typ: 'relabel',
      config: {
        action: 'replace',
      },
    },
  ],
};

export const CALLBACK_KEYS = ['url', 'basic_auth_user', 'basic_auth_pass', 'header', 'timeout', 'insecure_skip_verify', 'proxy'];

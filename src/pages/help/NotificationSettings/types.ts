export interface WebhookType {
  enable: boolean;
  note: string;
  url: string;
  timeout: number;
  basic_auth_user: string;
  basic_auth_password: string;
  headers: {
    [key: string]: string;
  };
  skip_verify: boolean;
}

export interface ScriptType {
  enable: boolean;
  content: string;
  timeout: number;
  type: 0 | 1;
}

export interface ChannelType {
  name: string;
  ident: string;
  hide: boolean;
  built_in: boolean;
}

export interface ContactType {
  name: string;
  ident: string;
  hide: boolean;
  built_in: boolean;
}

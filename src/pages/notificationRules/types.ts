interface RuleConfig {
  channel: string;
  template: string;
  params: {
    [index: string]: any;
  }[];
  severities: number[];
  time_ranges: {
    start: string;
    end: string;
    week: number[];
  }[];
  label_keys: {
    [index: string]: string;
  }[];
}

export interface RuleItem {
  id: number;
  name: string;
  description: string;
  enable: boolean;
  user_group_ids: string[];
  notify_configs: RuleConfig[];
}

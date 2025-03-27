import { Moment } from 'moment';

interface RuleConfig {
  channel_id: number;
  channel?: string;
  template_id: number;
  template?: string;
  params: {
    [index: string]: any;
  }[];
  severities: number[];
  time_ranges: {
    start: Moment;
    end: Moment;
    week: number[];
  }[];
  label_keys: {
    [index: string]: string;
  }[];
  attributes: {
    key: string;
    func: string;
    value: string;
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

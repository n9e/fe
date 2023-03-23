export interface RuleCateType {
  name: string;
  icon_url: string;
  alert_rules: {
    [index: string]: RuleType[];
  };
  favorite: boolean;
}

export interface RuleType {
  cate: string;
  fname: string;
  name: string;
  append_tags: string[];
  __cate__: string;
  __group__: string;
}

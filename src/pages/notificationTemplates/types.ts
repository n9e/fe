export interface Item {
  id: number;
  name: string;
  ident: string;
  content: {
    [index: string]: string | undefined;
  };
  user_group_ids: number[];
  private: 0 | 1; // 0: 公共 1: 私有
  notify_channel_ident: string;
  create_by: string;
}

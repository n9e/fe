export interface View {
  id: number;
  name: string;
  page: string;
  filter: string;
  public_cate: 0 | 1 | 2; // 0: 私有, 1: 团队, 2: 全部
  gids?: number[]; // 适用的团队id列表
  is_favorite: boolean;
}

export interface ModalStat {
  visible: boolean;
  action?: 'save_new' | 'edit';
  values?: View;
}

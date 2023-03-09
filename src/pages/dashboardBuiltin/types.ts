export interface BoardCateType {
  name: string;
  icon_url: string;
  boards: BoardType[];
  favorite: boolean;
}

export interface BoardType {
  cate: string;
  fname: string;
  name: string;
  tags: string;
}

export interface BoardCateIconType {
  name: string;
  icon_url: string;
}

export interface TreeNodes {
  id: number,
  pid: number,
  ident: string,
  name: string,
  path: string,
  type: number,
  leaf: number,
  cate?: string,
  note?: string,
  children?: TreeNodes[],
  icon_color: string,
  icon_char: string,
}

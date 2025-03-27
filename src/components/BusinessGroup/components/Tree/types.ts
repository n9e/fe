export interface TreeNode {
  id: string;
  key: string;
  title: string;
  originName?: string;
  selectable?: boolean;
  isLeaf?: boolean;
  children?: TreeNode[];
}

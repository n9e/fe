export interface LLMConfig {
  id: number;
  name: string;
}

export type SourceType = 'local' | 'git';
export type GitRefType = 'branch' | 'tag' | 'commit';
export type GitAuthType = 'none' | 'token';

export interface GitInfo {
  url: string;
  ref_type: GitRefType;
  ref: string;
  auth_type: GitAuthType;
  subdir?: string;
  current_commit?: string;
}

export interface GitInstallPayload {
  git_url: string;
  git_ref_type: GitRefType;
  git_ref: string;
  git_auth_type?: GitAuthType;
  git_token?: string;
  git_subdir?: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;

  user_group_ids?: number[];
  private?: 0 | 1;

  builtin: boolean;
  instructions: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  metadata?: Record<string, any>;

  source_type?: SourceType;
  git_info?: GitInfo;
  has_new_version?: boolean;
}

export interface FormValues {
  name: string;
  description: string;
  enabled: boolean;

  user_group_ids?: number[];
  private?: 0 | 1;

  instructions: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  metadata?: Record<string, any>;
}

export interface FileItem {
  id: number;
  skill_id: number;
  name: string;
  size: number;
  created_at: string;
  created_by: string;
}

export interface SkillDetail extends Item {
  files: FileItem[];
}

export interface FileContent extends FileItem {
  content: string;
}

export type SkillTreeNodeType = 'skill' | 'directory' | 'resource-file';

export interface SkillTreeNode {
  key: string;
  title: string;
  nodeType: SkillTreeNodeType;
  skillId: number;
  selectable: boolean;
  isLeaf?: boolean;
  children?: SkillTreeNode[];
  enabled?: boolean;
  builtin?: boolean;
  file?: FileItem;
  path?: string;
  has_new_version?: boolean;
}

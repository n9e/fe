import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface AISkill {
  id: number;
  name: string;
  description: string;
  instructions: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowed_tools?: string;
  enabled: boolean;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
  files?: AISkillFile[];
}

export interface AISkillFile {
  id: number;
  skill_id: number;
  name: string;
  content?: string;
  size: number;
  created_at: number;
  created_by: string;
  updated_at?: number;
  updated_by?: string;
}

export function getAISkills(search?: string) {
  return request('/api/n9e/ai-skills', { method: RequestMethod.Get, params: { search: search || '' } }).then((res) => res.dat ?? []);
}

export function getAISkill(id: number) {
  return request(`/api/n9e/ai-skill/${id}`, { method: RequestMethod.Get }).then((res) => res.dat);
}

export function addAISkill(data: Partial<AISkill>) {
  return request('/api/n9e/ai-skills', { method: RequestMethod.Post, data });
}

export function updateAISkill(id: number, data: Partial<AISkill>) {
  return request(`/api/n9e/ai-skill/${id}`, { method: RequestMethod.Put, data });
}

export function deleteAISkill(id: number) {
  return request(`/api/n9e/ai-skill/${id}`, { method: RequestMethod.Delete });
}

// POST /api/n9e/ai-skills/import — create new skill from .zip / .tar.gz / .tgz
export function importAISkill(formData: FormData) {
  return request('/api/n9e/ai-skills/import', {
    method: RequestMethod.Post,
    data: formData,
  });
}

// PUT /api/n9e/ai-skill/:id/import — replace existing skill from .zip / .tar.gz / .tgz
export function updateImportAISkill(id: number, formData: FormData) {
  return request(`/api/n9e/ai-skill/${id}/import`, {
    method: RequestMethod.Put,
    data: formData,
  });
}

export function getAISkillFile(fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, { method: RequestMethod.Get }).then((res) => res.dat);
}

export function deleteAISkillFile(fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, { method: RequestMethod.Delete });
}

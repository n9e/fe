import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface AISkill {
  id: number;
  name: string;
  description: string;
  instructions: string;
  is_builtin: number;
  enabled: number;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
}

export interface AISkillFile {
  id: number;
  skill_id: number;
  name: string;
  content?: string;
  size: number;
  created_at: number;
  created_by: string;
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

export function importAISkill(formData: FormData) {
  return request('/api/n9e/ai-skills/import', {
    method: RequestMethod.Post,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getAISkillFiles(skillId: number) {
  return request(`/api/n9e/ai-skill/${skillId}/files`, { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

export function uploadAISkillFile(skillId: number, formData: FormData) {
  return request(`/api/n9e/ai-skill/${skillId}/files`, {
    method: RequestMethod.Post,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getAISkillFile(fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, { method: RequestMethod.Get }).then((res) => res.dat);
}

export function deleteAISkillFile(fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, { method: RequestMethod.Delete });
}

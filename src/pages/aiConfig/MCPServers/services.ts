import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface MCPServer {
  id: number;
  name: string;
  url: string;
  headers: string;
  env_vars: string;
  description: string;
  enabled: number;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
}

export function getMCPServers() {
  return request('/api/n9e/mcp-servers', { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

export function addMCPServer(data: Partial<MCPServer>) {
  return request('/api/n9e/mcp-servers', { method: RequestMethod.Post, data });
}

export function updateMCPServer(id: number, data: Partial<MCPServer>) {
  return request(`/api/n9e/mcp-server/${id}`, { method: RequestMethod.Put, data });
}

export function deleteMCPServer(id: number) {
  return request(`/api/n9e/mcp-server/${id}`, { method: RequestMethod.Delete });
}

export function testMCPServer(id: number) {
  return request(`/api/n9e/mcp-server/${id}/test`, { method: RequestMethod.Post }).then((res) => res.dat);
}

export function testMCPServerConfig(data: { url: string; headers: string }) {
  return request('/api/n9e/mcp-servers/test', { method: RequestMethod.Post, data }).then((res) => res.dat);
}

export function getMCPServerTools(id: number) {
  return request(`/api/n9e/mcp-server/${id}/tools`, { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

// ============================================
// DevForge AI — Projects React Query Hooks
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import type { Project } from '@/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

// Ensure timestamps from the backend are treated as UTC
function toUTC(ts: string | undefined | null): string {
  if (!ts) return '';
  // If the timestamp has no timezone info (no Z, no +/-offset), append Z
  if (ts && !ts.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(ts)) {
    return ts + 'Z';
  }
  return ts;
}

// Transform snake_case API response to camelCase Project
function transformProject(raw: any): Project {
  return {
    id: raw.id,
    workspaceId: raw.workspace_id ?? raw.workspaceId ?? '',
    name: raw.name,
    description: raw.description ?? '',
    status: raw.status,
    config: raw.config ?? {},
    progress: raw.progress ?? 0,
    createdAt: toUTC(raw.created_at ?? raw.createdAt),
    updatedAt: toUTC(raw.updated_at ?? raw.updatedAt),
  };
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/projects');
      return response.data.map(transformProject);
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<any>(`/projects/${id}`);
      return transformProject(response.data);
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      targetUsers?: string;
      techStack?: string;
      language?: string;
      deployTarget?: string;
      disabledAgents?: string[];
    }) => {
      const response = await apiClient.post<Project>('/projects', {
        name: data.name,
        description: data.description,
        config: {
          targetUsers: data.targetUsers,
          techStack: data.techStack,
          language: data.language,
          deployTarget: data.deployTarget,
          disabledAgents: data.disabledAgents || [],
        },
      });
      return response.data;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      navigate(`/dashboard/projects/${project.id}/workspace`);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await apiClient.put<Project>(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updated.id) });
    },
  });
}

export function useRunOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiClient.post<any>(`/projects/${projectId}/run`);
      return transformProject(response.data);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updated.id) });
    },
  });
}

export function useRunAgentNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, agentKey }: { projectId: string; agentKey: string }) => {
      const response = await apiClient.post<any>(`/projects/${projectId}/agents/run`, {
        agent_key: agentKey,
      });
      return transformProject(response.data);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updated.id) });
    },
  });
}

export function useSendAgentChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      agentKey,
      message,
    }: {
      projectId: string;
      agentKey?: string;
      message: string;
    }) => {
      const response = await apiClient.post<any>(`/projects/${projectId}/chat`, {
        agent_key: agentKey || 'all',
        message,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useGetProjectConsistency(projectId: string) {
  return useQuery({
    queryKey: [...projectKeys.detail(projectId), 'consistency'],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/projects/${projectId}/consistency`);
      return response.data;
    },
    enabled: !!projectId,
  });
}


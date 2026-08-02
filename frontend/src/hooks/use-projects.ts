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
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    updatedAt: raw.updated_at ?? raw.updatedAt ?? '',
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
    }) => {
      const response = await apiClient.post<Project>('/projects', {
        name: data.name,
        description: data.description,
        config: {
          targetUsers: data.targetUsers,
          techStack: data.techStack,
          language: data.language,
          deployTarget: data.deployTarget,
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

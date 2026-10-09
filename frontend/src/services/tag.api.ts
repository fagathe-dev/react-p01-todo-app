import { TaskTag } from '@/types/app.types';
import { fetchAPI } from './fetchAPI';
import { TaskResponse } from './task.api';

export interface CreateTagDto {
  name: string;
  color?: TaskTag['color'];
  description?: string | null;
}

export interface UpdateTagDto {
  name?: string;
  color?: TaskTag['color'];
  description?: string | null;
}

// --------------------------------------------------
// Requêtes API Tags (CRUD)
// --------------------------------------------------

/**
 * Récupère la liste complète des tags de l'utilisateur connecté
 */
export const fetchTags = async (): Promise<TaskTag[]> => {
  const res = await fetchAPI<TaskTag[]>('/tags');

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des tags');
  }

  return res.data ?? [];
};

/**
 * Récupère un tag spécifique par son identifiant
 */
export const fetchTagById = async (id: string): Promise<TaskTag> => {
  const res = await fetchAPI<TaskTag>(`/tags/${id}`);

  if (!res.ok) {
    throw new Error('Tag introuvable');
  }

  return res.data;
};

/**
 * Crée un nouveau tag (nom, couleur de pastille et description facultative)
 */
export const createTag = async (dto: CreateTagDto): Promise<TaskTag> => {
  const res = await fetchAPI<TaskTag>('/tags', {
    method: 'POST',
    body: dto,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la création du tag'
    );
  }

  return res.data;
};

/**
 * Met à jour les propriétés d'un tag existant
 */
export const updateTag = async (
  id: string,
  dto: UpdateTagDto
): Promise<{ success: boolean }> => {
  const res = await fetchAPI<{ success: boolean }>(`/tags/${id}`, {
    method: 'PUT',
    body: dto,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la mise à jour du tag'
    );
  }

  return res.data;
};

/**
 * Supprime un tag (dissocie les tâches rattachées en cascade en base)
 */
export const deleteTag = async (id: string): Promise<void> => {
  const res = await fetchAPI(`/tags/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la suppression du tag'
    );
  }
};

/**
 * Récupère toutes les tâches associées à un tag donné
 */
export const fetchTagTasks = async (tagId: string): Promise<TaskResponse[]> => {
  const res = await fetchAPI<TaskResponse[]>(`/tags/${tagId}/tasks`);

  if (!res.ok) {
    throw new Error('Impossible de récupérer les tâches de ce tag');
  }

  return res.data ?? [];
};

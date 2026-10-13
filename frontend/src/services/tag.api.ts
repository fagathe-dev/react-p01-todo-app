import { CreateTagPayload, Tag, UpdateTagPayload } from '@/types/tag.types';
import { fetchAPI } from './fetchAPI';

export const fetchTags = async (): Promise<Tag[]> => {
  const res = await fetchAPI<Tag[]>('/tags');
  if (!res.ok) throw new Error('Erreur lors de la récupération des tags');
  return res.data ?? [];
};

export const fetchTagById = async (id: string): Promise<Tag> => {
  const res = await fetchAPI<Tag>(`/tags/${id}`);
  if (!res.ok) throw new Error('Tag introuvable');
  return res.data;
};

export const createTag = async (dto: CreateTagPayload): Promise<Tag> => {
  const res = await fetchAPI<Tag>('/tags', {
    method: 'POST',
    body: dto,
  });
  if (!res.ok) throw new Error((res.data as any)?.message || 'Erreur création');
  return res.data;
};

export const updateTag = async (
  id: string,
  dto: UpdateTagPayload
): Promise<Tag> => {
  const res = await fetchAPI<Tag>(`/tags/${id}`, {
    method: 'PUT',
    body: dto,
  });
  if (!res.ok)
    throw new Error((res.data as any)?.message || 'Erreur mise à jour');
  return res.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  const res = await fetchAPI(`/tags/${id}`, { method: 'DELETE' });
  if (!res.ok)
    throw new Error((res.data as any)?.message || 'Erreur suppression');
};

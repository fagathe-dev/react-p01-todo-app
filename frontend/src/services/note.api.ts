import { CreateNotePayload, Note, UpdateNotePayload } from '@/types/note.types';
import { fetchAPI } from './fetchAPI';

const extractError = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;
  const d = data as Record<string, any>;
  if (d.message) return d.message;
  if (Array.isArray(d.violations) && d.violations.length > 0) {
    return d.violations.map((v: any) => v.message).join(' — ');
  }
  return fallback;
};

export const fetchNotes = async (
  filter?: 'open' | 'archived' | 'trash'
): Promise<Note[]> => {
  const query = filter ? `?filter=${filter}` : '';
  const res = await fetchAPI<Note[]>(`/notes${query}`);
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors du chargement des notes.')
    );
  return res.data ?? [];
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const res = await fetchAPI<Note>(`/notes/${id}`);
  if (!res.ok) throw new Error(extractError(res.data, 'Note introuvable.'));
  return res.data;
};

export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const res = await fetchAPI<Note>('/notes', { method: 'POST', body: payload });
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors de la création de la note.')
    );
  return res.data;
};

export const updateNote = async (
  id: string,
  payload: UpdateNotePayload | FormData
): Promise<Note> => {
  const res = await fetchAPI<Note>(`/notes/${id}`, {
    method: 'POST',
    body: payload,
  });
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors de la modification de la note.')
    );
  return res.data;
};

export const restoreNote = async (id: string): Promise<Note> => {
  const res = await fetchAPI<Note>(`/notes/${id}/restore`, { method: 'POST' });
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors de la restauration de la note.')
    );
  return res.data;
};

export const deleteNote = async (
  id: string,
  permanent = false
): Promise<void> => {
  const res = await fetchAPI(
    `/notes/${id}${permanent ? '?permanent=true' : ''}`,
    { method: 'DELETE' }
  );
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors de la suppression de la note.')
    );
};

export const deleteNoteFile = async (
  noteId: string,
  fileId: string
): Promise<void> => {
  const res = await fetchAPI(`/notes/${noteId}/files/${fileId}`, {
    method: 'DELETE',
  });
  if (!res.ok)
    throw new Error(
      extractError(res.data, 'Erreur lors de la suppression du fichier.')
    );
};

export const emptyTrash = async (): Promise<void> => {
  const res = await fetchAPI('/notes/trash/empty', {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(
      extractError(res.data, 'Erreur lors du vidage de la corbeille.')
    );
  }
};

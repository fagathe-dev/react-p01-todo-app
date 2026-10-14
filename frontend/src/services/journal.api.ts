import { JOURNAL_TOKEN_KEY, useJournalStore } from '@/stores/journal.store';
import {
  CreateEntryPayload,
  Entry,
  UnlockJournalPayload,
  UnlockJournalResponse,
  UpdateEntryPayload,
} from '@/types/journal.types';
import { fetchAPI } from './fetchAPI';
import { sessionAppStorage } from './storage.service';

const JOURNAL_URL = '/journal';

const getJournalHeaders = (): Record<string, string> => {
  const token = (sessionAppStorage.get(JOURNAL_TOKEN_KEY) as string | null) ?? useJournalStore.getState().token;

  return token ? { 'X-JOURNAL-AUTH': token } : {};
};

const handleUnauthorized = (status: number) => {
  if (status === 403) {
    useJournalStore.getState().lock();
  }
};

const extractErr = (data: unknown, fallback: string): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as { message: unknown }).message);
  }
  return fallback;
};

/**
 * 1. Envoi du code secret vers l'API
 * 2. Réception du jCodeToken
 * 3. Enregistrement dans le store / sessionStorage
 */
export const unlockJournal = async (passcode: string): Promise<string> => {
  const payload: UnlockJournalPayload = { passcode };
  const res = await fetchAPI<UnlockJournalResponse>(`${JOURNAL_URL}/unlock`, {
    method: 'POST',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Code secret incorrect.'));
  }

  const token = res.data.jCodeToken;
  useJournalStore.getState().unlock(token);

  return token;
};

export const fetchEntries = async (): Promise<Entry[]> => {
  const res = await fetchAPI<Entry[]>(JOURNAL_URL, {
    headers: getJournalHeaders(),
  });

  handleUnauthorized(res.status);
  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Impossible de charger le journal.'));
  }

  return res.data ?? [];
};

export const fetchEntryById = async (id: string): Promise<Entry> => {
  const res = await fetchAPI<Entry>(`${JOURNAL_URL}/${id}`, {
    headers: getJournalHeaders(),
  });

  handleUnauthorized(res.status);
  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Entrée introuvable.'));
  }

  return res.data;
};

export const createEntry = async (payload: CreateEntryPayload): Promise<Entry> => {
  const res = await fetchAPI<Entry>(JOURNAL_URL, {
    method: 'POST',
    body: payload,
    headers: getJournalHeaders(),
  });

  handleUnauthorized(res.status);
  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Erreur lors de la création de l’entrée.'));
  }

  return res.data;
};

export const updateEntry = async (id: string, payload: UpdateEntryPayload): Promise<Entry> => {
  const hasFiles =
    (payload.medias && payload.medias.length > 0) || (payload.deletedMedias && payload.deletedMedias.length > 0);

  let body: FormData | UpdateEntryPayload = payload;
  let method: 'POST' | 'PATCH' = 'PATCH';

  if (hasFiles) {
    method = 'POST';
    const fd = new FormData();

    if (payload.title !== undefined) fd.append('title', payload.title ?? '');
    if (payload.content !== undefined) fd.append('content', payload.content ?? '');
    if (payload.color !== undefined) fd.append('color', payload.color ?? '');
    if (payload.mood !== undefined) fd.append('mood', payload.mood ?? '');
    if (payload.tag !== undefined) fd.append('tag', payload.tag ?? '');
    if (payload.isPinned !== undefined) fd.append('isPinned', String(payload.isPinned));
    if (payload.location !== undefined) {
      fd.append('location', payload.location ? JSON.stringify(payload.location) : '');
    }

    payload.deletedMedias?.forEach((mediaId) => {
      fd.append('deleted_medias[]', mediaId);
    });

    payload.medias?.forEach((file) => {
      fd.append('medias[]', file, file.name);
    });

    body = fd;
  }

  const res = await fetchAPI<Entry>(`${JOURNAL_URL}/${id}`, {
    method,
    body,
    headers: getJournalHeaders(),
  });

  handleUnauthorized(res.status);
  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Erreur lors de la mise à jour de l’entrée.'));
  }

  return res.data;
};

export const deleteEntry = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${JOURNAL_URL}/${id}`, {
    method: 'DELETE',
    headers: getJournalHeaders(),
  });

  handleUnauthorized(res.status);
  if (!res.ok) {
    throw new Error(extractErr(res.data, 'Erreur lors de la suppression de l’entrée.'));
  }
};

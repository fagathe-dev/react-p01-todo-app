import { ColorEnum, Tag } from './tag.types';

export type MoodEnum =
  | 'angry'
  | 'anxious'
  | 'exhausted'
  | 'frustrated'
  | 'grateful'
  | 'happy'
  | 'lost'
  | 'hopeful'
  | 'in_love'
  | 'neutral'
  | 'motivated'
  | 'relaxed'
  | 'radiant'
  | 'sad'
  | 'stressed';

export const MOOD_META: Record<MoodEnum, { emoji: string; label: string }> = {
  angry: { emoji: '😡', label: 'En colère' },
  anxious: { emoji: '😟', label: 'Anxieux' },
  exhausted: { emoji: '😫', label: 'Épuisé' },
  frustrated: { emoji: '😤', label: 'Frustré' },
  grateful: { emoji: '🙏', label: 'Reconnaissant' },
  happy: { emoji: '🙂', label: 'Heureux' },
  lost: { emoji: '😕', label: 'Perdu' },
  hopeful: { emoji: '🤞', label: "Plein d'espoir" },
  in_love: { emoji: '😍', label: 'Amoureux' },
  neutral: { emoji: '😐', label: 'Neutre' },
  motivated: { emoji: '💪', label: 'Motivé' },
  relaxed: { emoji: '😌', label: 'Détendu' },
  radiant: { emoji: '🤩', label: 'Rayonnant' },
  sad: { emoji: '😔', label: 'Triste' },
  stressed: { emoji: '😰', label: 'Stressé' },
};

export interface EntryLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  street?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface EntryMedia {
  id: string;
  originalName: string;
  niceName?: string | null;
  filePath: string;
  mimeType: string;
  type?: 'image' | 'video' | 'audio' | string | null;
  extension: string;
  size: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Entry {
  id: string;
  title: string | null;
  content: string | null;
  slug?: string | null;
  color?: ColorEnum | null;
  mood?: MoodEnum | null;
  isPinned: boolean;
  tag?: Tag | null;
  location?: EntryLocation | null;
  entryMedia?: EntryMedia[];
  created_at: string;
  updated_at?: string | null;
}

export interface CreateEntryPayload {
  title?: string | null;
  content?: string | null;
  color?: ColorEnum | null;
  mood?: MoodEnum | null;
  isPinned?: boolean;
  tag?: string | null;
  location?: EntryLocation | null;
}

export interface UpdateEntryPayload extends Partial<CreateEntryPayload> {
  medias?: File[];
  deletedMedias?: string[];
}

export interface UnlockJournalPayload {
  passcode: string;
}

export interface UnlockJournalResponse {
  jCodeToken: string;
  message: string;
}

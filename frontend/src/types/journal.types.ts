import { Tag, ColorEnum } from './tag.types';

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

export interface EntryMedia {
  id: string;
  originalName: string;
  niceName?: string | null;
  filePath: string;
  mimeType: string;
  type?: string | null;
  extension: string;
  size: number;
  createdAt: string;
  updatedAt?: string | null;
  isPinned: boolean;
}

export interface Entry {
  id: string;
  title: string | null;
  content: string | null;
  slug: string | null;
  color: ColorEnum | null;
  mood: MoodEnum | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string | null;
  tag: Tag | null;
  entryMedia?: EntryMedia[];
}

export interface CreateEntryPayload {
  title?: string | null;
  content?: string | null;
  color?: ColorEnum | null;
  mood?: MoodEnum | null;
  tag?: string | null; // L'identifiant (UUID) du tag
}

export type UpdateEntryPayload = Partial<CreateEntryPayload>;
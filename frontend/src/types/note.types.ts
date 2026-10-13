import { Tag, ColorEnum } from './tag.types';

export type StateEnum = 'open' | 'archived' | 'trash';

export interface NoteFile {
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

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  state: StateEnum;
  color: ColorEnum | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  tag: Tag | null;
  files?: NoteFile[];
}

export interface CreateNotePayload {
  title?: string | null;
  content?: string | null;
  state?: StateEnum;
  color?: ColorEnum | null;
  tag?: string | null; // L'identifiant (UUID) du tag
}

export type UpdateNotePayload = Partial<CreateNotePayload>;
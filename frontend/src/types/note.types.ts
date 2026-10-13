import { ColorEnum, Tag } from './tag.types';

export type StateEnum = 'open' | 'archived' | 'trash';

export interface NoteFile {
  id: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
}

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  state: StateEnum;
  color: ColorEnum | null;
  is_pinned: boolean;
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
  tag?: string | null;
  is_pinned?: boolean;
}

export type UpdateNotePayload = Partial<CreateNotePayload>;

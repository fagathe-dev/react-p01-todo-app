export const tagColors = {
  red: '#e7000b',
  orange: '#f54900',
  yellow: '#fdc700',
  green: '#00a63e',
  cyan: '#0092b8',
  blue: '#155dfc',
  purple: '#9810fa',
  violet: '#7f22fe',
  fuchsia: '#c800de',
  pink: '#e60076',
  slate: '#45556c',
  gray: '#4a5565',
  stone: '#57534d',
} as const;

export type ColorEnum = keyof typeof tagColors;

export interface Tag {
  id: string;
  name: string;
  color: ColorEnum | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateTagPayload {
  name: string;
  color: ColorEnum;
  description?: string | null;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
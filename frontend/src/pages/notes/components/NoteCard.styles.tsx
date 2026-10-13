// src/pages/notes/components/NoteCard.styles.ts
import { tagColors } from '@/types/tag.types';
import styled from 'styled-components';

export const PinBtn = styled.button<{ $pinned: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  color: ${({ $pinned, theme }) => ($pinned ? theme.colors.primary.base : theme.colors.text.muted)};
  opacity: ${({ $pinned }) => ($pinned ? 1 : 0)};
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
    opacity: 1 !important;
  }
`;

export const Card = styled.div<{ $color?: string | null }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3.5]} ${theme.spacing[4]}`};
  background-color: ${({ $color, theme }) =>
    $color ? `${tagColors[$color as keyof typeof tagColors]}15` : theme.colors.background.surface};
  border: 1px solid
    ${({ $color, theme }) =>
      $color ? `${tagColors[$color as keyof typeof tagColors]}45` : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};

    ${PinBtn} {
      opacity: 1;
    }
  }
`;

export const MarkdownPreview = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  word-break: break-word;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    margin: 0 0 4px;
  }
  p:last-child {
    margin-bottom: 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: 600;
    margin: 4px 0 2px;
    color: ${({ theme }) => theme.colors.text.heading};
  }
  ul,
  ol {
    margin: 0 0 4px;
    padding-left: 16px;
  }
  code {
    background-color: rgba(0, 0, 0, 0.06);
    padding: 1px 3px;
    border-radius: 3px;
    font-family: monospace;
  }
  mark {
    background-color: #fef08a;
    padding: 0 2px;
    border-radius: 2px;
  }
  a {
    color: ${({ theme }) => theme.colors.primary.base};
    text-decoration: underline;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing[2]};
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

export const TagBadge = styled.span<{ $color?: string | null }>`
  font-size: 11px;
  padding: 1px 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ $color }) => ($color ? `${tagColors[$color as keyof typeof tagColors]}25` : '#88888825')};
  color: ${({ $color }) => ($color ? tagColors[$color as keyof typeof tagColors] : '#888')};
`;

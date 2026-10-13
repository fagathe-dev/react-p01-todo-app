import { tagColors } from '@/types/tag.types';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const Box = styled.div<{ $color?: string | null }>`
  width: 100%;
  max-width: 650px;
  background-color: ${({ $color, theme }) =>
    $color
      ? `color-mix(in srgb, ${tagColors[$color as keyof typeof tagColors]} 20\%,${theme.colors.background.surface})`
      : theme.colors.background.surface};
  border: 1px solid
    ${({ $color, theme }) =>
      $color ? `${tagColors[$color as keyof typeof tagColors]}50` : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 4px;
`;

const TitleInput = styled.input`
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.heading};
`;

const TabRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 4px;
`;

const TabBtn = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary.base : 'transparent')};
  padding: 4px 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.heading : theme.colors.text.muted)};
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

const ContentArea = styled.textarea`
  width: 100%;
  min-height: 80vh;
  padding: 10px 16px;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.heading};
  resize: vertical;
  box-sizing: border-box;
`;

const PreviewArea = styled.div`
  width: 100%;
  min-height: 30vh;
  max-height: 85vh;
  overflow-y: auto;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.heading};
  box-sizing: border-box;

  p {
    margin: 0 0 8px;
  }
  p:last-child {
    margin-bottom: 0;
  }
  h1,
  h2,
  h3,
  h4 {
    margin: 8px 0 4px;
    font-weight: 600;
  }
  h1 {
    font-size: 1.25rem;
  }
  h2 {
    font-size: 1.1rem;
  }
  h3 {
    font-size: 1rem;
  }
  ul,
  ol {
    margin: 0 0 8px;
    padding-left: 20px;
  }
  code {
    background-color: rgba(0, 0, 0, 0.06);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
  }
  mark {
    background-color: #fef08a;
    padding: 0 2px;
    border-radius: 2px;
  }
  blockquote {
    margin: 0 0 8px;
    padding-left: 10px;
    border-left: 3px solid rgba(0, 0, 0, 0.15);
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

export { Backdrop, Box, ContentArea, PreviewArea, TabBtn, TabRow, TitleInput, Toolbar, TopRow };

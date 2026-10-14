import { ColorEnum } from '@/types/tag.types';
import styled from 'styled-components';

export const FormRoot = styled.form<{ $color?: ColorEnum | null }>`
  display: flex;
  flex-direction: column;
  background-color: inherit;
  border-radius: ${({ theme }) => theme.radii.base};
  width: 100%;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
`;

export const TitleField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 600;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.heading};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const TabHeader = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const TabBtn = styled.button<{ $active: boolean }>`
  border: none;
  background: none;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary.base : 'transparent')};
  padding: 8px 4px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.heading : theme.colors.text.muted)};
  cursor: pointer;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 280px;
  border: none;
  outline: none;
  padding: 16px 20px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.heading};
  box-sizing: border-box;
`;

export const Preview = styled.div`
  min-height: 280px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

export const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ToolSquareBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: ${({ $active, theme }) => ($active ? `1px solid ${theme.colors.border.default}` : 'none')};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.heading};
  font-size: 20px;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

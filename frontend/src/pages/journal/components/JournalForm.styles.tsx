import { ColorEnum } from '@/types/tag.types';
import styled from 'styled-components';

const FormRoot = styled.form<{ $color?: ColorEnum | null }>`
  display: flex;
  flex-direction: column;
  background-color: inherit;
  border-radius: ${({ theme }) => theme.radii.base};
  width: 100%;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
`;

const TitleField = styled.input`
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

const TextArea = styled.textarea`
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

const Preview = styled.div`
  min-height: 280px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ToolSquareBtn = styled.button<{ $active?: boolean }>`
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

export { FormRoot, Preview, TextArea, TitleField, Toolbar, ToolGroup, ToolSquareBtn, TopBar };

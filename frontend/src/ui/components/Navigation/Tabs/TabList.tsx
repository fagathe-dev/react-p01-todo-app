import { BaseComponentProps } from '@/ui/types';
import styled from 'styled-components';

export const TabList = styled.div.attrs({
  role: 'tablist',
})<BaseComponentProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  width: 100%;
`;

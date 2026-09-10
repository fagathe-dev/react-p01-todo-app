import { BaseComponentProps } from '@/ui/types';
import styled from 'styled-components';

export const NavbarNav = styled.div<BaseComponentProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

import { BaseComponentProps } from '@/ui/types';
import styled, { css } from 'styled-components';

export interface NavbarProps extends BaseComponentProps {
  sticky?: boolean;
}

export const Navbar = styled.nav<{ $sticky?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  box-sizing: border-box;

  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      top: 0;
      z-index: 100;
    `}
`;

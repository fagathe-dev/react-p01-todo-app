import { BaseComponentProps } from '@/ui/types';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export interface ToastContainerProps extends BaseComponentProps {
  position?: ToastPosition;
}

const positionStyles = {
  'top-right': 'top: 1.5rem; right: 1.5rem;',
  'top-left': 'top: 1.5rem; left: 1.5rem;',
  'bottom-right': 'bottom: 1.5rem; right: 1.5rem;',
  'bottom-left': 'bottom: 1.5rem; left: 1.5rem;',
};

const Wrapper = styled.div<{ $position: ToastPosition }>`
  position: fixed;
  ${({ $position }) => positionStyles[$position]}
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

export const ToastContainer = ({
  position = 'bottom-right',
  children,
  ...rest
}: ToastContainerProps) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <Wrapper $position={position} {...rest}>
      {children}
    </Wrapper>,
    document.body
  );
};

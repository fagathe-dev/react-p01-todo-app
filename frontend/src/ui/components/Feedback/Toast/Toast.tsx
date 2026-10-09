import { Icon } from '@/ui/components/Base/Icon';
import { IconButton } from '@/ui/components/Base/IconButton';
import { BaseComponentProps } from '@/ui/types';
import { useEffect } from 'react';
import styled, { css } from 'styled-components';

export type ToastVariant = 'success' | 'danger' | 'info' | 'warning';

export interface ToastProps extends BaseComponentProps {
  variant?: ToastVariant;
  title?: string;
  duration?: number; // millisecondes (ex: 4000)
  onClose?: () => void;
}

const ToastWrapper = styled.div<{ $variant: ToastVariant }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[2.5]} ${theme.spacing[3.5]}`};
  min-width: 280px;
  max-width: 420px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  ${({ $variant, theme }) => {
    const role = theme.colors[$variant];
    return css`
      border-left: 4px solid ${role.base};
      & > i {
        color: ${role.base};
      }
    `;
  }}
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.heading};
`;

const toastIcons: Record<ToastVariant, string> = {
  success: 'check-circle',
  danger: 'alert-circle',
  warning: 'alert',
  info: 'information',
};

export const Toast = ({
  variant = 'info',
  title,
  duration = 4000,
  onClose,
  children,
  ...rest
}: ToastProps) => {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastWrapper $variant={variant} role="status" {...rest}>
      <Icon name={toastIcons[variant]} size={18} />
      <Content>
        {title && <ToastTitle>{title}</ToastTitle>}
        <div>{children}</div>
      </Content>
      {onClose && (
        <IconButton
          name="close"
          size="sm"
          variant="ghost"
          aria-label="Fermer"
          onClick={onClose}
        />
      )}
    </ToastWrapper>
  );
};

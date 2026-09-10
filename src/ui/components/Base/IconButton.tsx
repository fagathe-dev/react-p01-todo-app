import styled from 'styled-components';
import { Button, ButtonProps } from './Button';
import { Icon } from './Icon';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  name: string;
  'aria-label': string;
  round?: boolean;
}

const dimensions = {
  sm: '28px',
  base: '36px',
  lg: '44px',
};

const iconSizes = {
  sm: 14,
  base: 18,
  lg: 22,
};

const StyledIconButton = styled(Button)<IconButtonProps>`
  padding: 0;
  width: ${({ size = 'base' }) => dimensions[size]};
  height: ${({ size = 'base' }) => dimensions[size]};
  border-radius: ${({ round, theme }) =>
    round ? theme.radii.full : theme.radii.base};
  flex-shrink: 0;
`;

export const IconButton = ({
  name,
  size = 'base',
  variant = 'ghost',
  round = false,
  ...rest
}: IconButtonProps) => {
  return (
    <StyledIconButton size={size} variant={variant} $round={round} {...rest}>
      <Icon name={name} size={iconSizes[size]} />
    </StyledIconButton>
  );
};

import { ColorEnum, tagColors } from '@/types/tag.types';
import styled from 'styled-components';

export const TagPill = styled.span<{ $color: ColorEnum }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  background-color: ${({ $color }) => `${tagColors[$color]}18`};
  color: ${({ $color }) => tagColors[$color]};
  border: 1px solid ${({ $color }) => `${tagColors[$color]}40`};
  white-space: nowrap;
`;

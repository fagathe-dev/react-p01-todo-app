import { Icon } from '@/ui/components/Base/Icon';
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
  className?: string;
}

const Nav = styled.nav`
  display: flex;
  justify-content: center;
`;

const List = styled.ul`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  display: inline-flex;
`;

const PageButton = styled.button<{ $isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing[1.5]};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border-radius: ${({ theme }) => theme.radii.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.surface};
  color: ${({ theme }) => theme.colors.text.body};
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.base};
    color: ${({ theme }) => theme.colors.primary.base};
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    css`
      background-color: ${theme.colors.primary.base};
      border-color: ${theme.colors.primary.base};
      color: ${theme.colors.white};
      font-weight: ${theme.typography.weights.semibold};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.hover};
        border-color: ${theme.colors.primary.hover};
        color: ${theme.colors.white};
      }
    `}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  disabled = false,
  className,
}) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), 'DOTS', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, 'DOTS', ...range(totalPages - rightItemCount + 1, totalPages)];
    }

    return [1, 'DOTS', ...range(leftSiblingIndex, rightSiblingIndex), 'DOTS', totalPages];
  }, [totalPages, siblingCount, currentPage]);

  if (totalPages <= 1) return null;

  return (
    <Nav aria-label="Navigation pagination" className={className}>
      <List>
        {showFirstLast && (
          <Item>
            <PageButton
              type="button"
              disabled={disabled || currentPage === 1}
              onClick={() => onPageChange(1)}
              aria-label="Première page"
            >
              <Icon name="chevron-double-left" size={16} />
            </PageButton>
          </Item>
        )}

        <Item>
          <PageButton
            type="button"
            disabled={disabled || currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Page précédente"
          >
            <Icon name="chevron-left" size={16} />
          </PageButton>
        </Item>

        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === 'DOTS') {
            return (
              <Item key={`dots-${idx}`}>
                <Ellipsis>&#8230;</Ellipsis>
              </Item>
            );
          }

          const page = pageNumber as number;
          const isCurrent = page === currentPage;

          return (
            <Item key={page}>
              <PageButton
                type="button"
                $isActive={isCurrent}
                disabled={disabled}
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </PageButton>
            </Item>
          );
        })}

        <Item>
          <PageButton
            type="button"
            disabled={disabled || currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Page suivante"
          >
            <Icon name="chevron-right" size={16} />
          </PageButton>
        </Item>

        {showFirstLast && (
          <Item>
            <PageButton
              type="button"
              disabled={disabled || currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Dernière page"
            >
              <Icon name="chevron-double-right" size={16} />
            </PageButton>
          </Item>
        )}
      </List>
    </Nav>
  );
};
import { updateTodo } from '@/services/todo.api';
import { tagColors } from '@/types/tag.types';
import { Todo } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { isoToDueDateCategory } from '@/utils/dueDate.resolver';
import { DateFormatter } from 'core-ts';
import React from 'react';
import styled, { css } from 'styled-components';

const Card = styled.div<{ $isDone: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[3.5]}`};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ $isDone }) =>
    $isDone &&
    css`
      opacity: 0.65;
    `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const MainContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex: 1;
  min-width: 0;
`;

const CircleCheck = styled.button<{ $isDone: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid
    ${({ $isDone, theme }) =>
      $isDone ? theme.colors.success.base : theme.colors.border.default};
  background-color: ${({ $isDone, theme }) =>
    $isDone ? theme.colors.success.base : 'transparent'};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};
  min-width: 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

const MetaItem = styled.span<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger?.base || '#e7000b' : theme.colors.text.muted};
`;

const TagChip = styled.span<{ $color?: string | null }>`
  font-size: 11px;
  padding: 1px 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ $color }) =>
    $color ? `${tagColors[$color as keyof typeof tagColors]}18` : '#88888818'};
  color: ${({ $color }) =>
    $color ? tagColors[$color as keyof typeof tagColors] : '#888'};
`;

export const TodoCard: React.FC<{
  todo: Todo;
  onTodoUpdated: (t: Todo) => void;
  onSelect: (t: Todo) => void;
}> = ({ todo, onTodoUpdated, onSelect }) => {
  const isDone = Boolean(todo.isDone);
  const fileCount = todo.files?.length ?? 0;
  const commentCount = todo.comments?.length ?? 0;
  const isOverdue =
    Boolean(todo.dueDate) &&
    isoToDueDateCategory(todo.dueDate) === 'overdue' &&
    !isDone;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = !isDone;
    onTodoUpdated({ ...todo, isDone: nextStatus });
    try {
      await updateTodo(todo.id, { isDone: nextStatus });
    } catch {
      onTodoUpdated({ ...todo, isDone });
    }
  };

  return (
    <Card $isDone={isDone} onClick={() => onSelect(todo)}>
      <MainContent>
        <CircleCheck type="button" $isDone={isDone} onClick={handleToggle}>
          {isDone && <Icon name="check" size={13} />}
        </CircleCheck>

        <TitleColumn>
          <Text
            size="sm"
            weight="medium"
            style={{ textDecoration: isDone ? 'line-through' : 'none' }}
          >
            {todo.name}
          </Text>

          <MetaRow>
            {todo.tag && (
              <TagChip $color={todo.tag.color}>{todo.tag.name}</TagChip>
            )}
            {todo.dueDate && (
              <MetaItem $danger={isOverdue}>
                <Icon
                  name={isOverdue ? 'alert-circle-outline' : 'calendar'}
                  size={13}
                />
                <span>{DateFormatter.short(todo.dueDate)}</span>
              </MetaItem>
            )}
            {fileCount > 0 && (
              <MetaItem title={`${fileCount} fichier(s)`}>
                <Icon name="paperclip" size={13} />
                <span>{fileCount}</span>
              </MetaItem>
            )}
            {commentCount > 0 && (
              <MetaItem title={`${commentCount} commentaire(s)`}>
                <Icon name="comment-text-outline" size={13} />
                <span>{commentCount}</span>
              </MetaItem>
            )}
          </MetaRow>
        </TitleColumn>
      </MainContent>

      <Icon name="chevron-right" size={16} color="#aaa" />
    </Card>
  );
};

import { TaskResponse, updateTask } from '@/services/task.api';
import { ColorEnum, tagColors } from '@/types/app.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { isoToDueDateCategory } from '@/utils/dueDate.resolver';
import { DateFormatter } from 'core-ts';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

const CardWrapper = styled.div<{ $isDone: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[2.5]} ${theme.spacing[3.5]}`};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition:
    border-color 0.15s ease,
    opacity 0.2s ease;

  ${({ $isDone }) =>
    $isDone &&
    css`
      opacity: 0.65;
    `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const TaskMain = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-width: 0;
  width: 100%;
`;

const CheckboxButton = styled.button<{ $isDone: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isDone, theme }) =>
    $isDone ? theme.colors.success.base : theme.colors.text.muted};
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.1);
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const TaskContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const TaskName = styled(Text)<{ $isDone: boolean }>`
  cursor: pointer;
  word-break: break-word;

  ${({ $isDone }) =>
    $isDone &&
    css`
      text-decoration: line-through;
    `}
`;

const InlineInput = styled.input`
  width: 100%;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.heading};
  background-color: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.base};
  outline: none;
  padding: 0;
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition:
    opacity 0.15s ease,
    color 0.15s ease;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const TagPill = styled(Link)<{
  $color?: ColorEnum | null;
}>`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid;
  border-color: ${({ $color, theme }) =>
    $color && tagColors[$color]
      ? tagColors[$color]
      : theme.colors.background.surfaceActive}40;
  background-color: ${({ $color, theme }) =>
    $color && tagColors[$color]
      ? tagColors[$color]
      : theme.colors.background.surfaceActive}18;
  color: ${({ $color, theme }) =>
    $color && tagColors[$color] ? tagColors[$color] : theme.colors.text.muted};
  white-space: nowrap;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const DueDateBadge = styled.span<{ $isOverdue: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[1.5]}`};
  border-radius: ${({ theme }) => theme.radii.base};
  white-space: nowrap;

  ${({ $isOverdue, theme }) =>
    $isOverdue
      ? css`
          color: ${theme.colors.danger.base};
          background-color: ${theme.colors.danger.subtle};
        `
      : css`
          color: ${theme.colors.text.muted};
          background-color: ${theme.colors.background.body};
        `}
`;

export interface TaskCardProps {
  task: TaskResponse;
  onTaskUpdated: (updatedTask: TaskResponse) => void;
  onEdit?: (task: TaskResponse) => void;
}

export const TaskCard = ({ task, onTaskUpdated, onEdit }: TaskCardProps) => {
  const isDone = Boolean(task.isDone);
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(task.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameDraft(task.name);
  }, [task.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleToggleDone = async () => {
    const nextStatus = !isDone;
    onTaskUpdated({ ...task, isDone: nextStatus });

    try {
      await updateTask(task.id, { isDone: nextStatus });
    } catch {
      onTaskUpdated({ ...task, isDone: isDone });
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    setIsEditing(false);

    if (!trimmed || trimmed === task.name) {
      setNameDraft(task.name);
      return;
    }

    const previousName = task.name;
    onTaskUpdated({ ...task, name: trimmed });

    try {
      await updateTask(task.id, { name: trimmed });
    } catch {
      onTaskUpdated({ ...task, name: previousName });
      setNameDraft(previousName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setNameDraft(task.name);
      setIsEditing(false);
    }
  };

  const isOverdue =
    Boolean(task.dueDate) &&
    isoToDueDateCategory(task.dueDate) === 'overdue' &&
    !isDone;

  return (
    <CardWrapper $isDone={isDone}>
      <TaskMain>
        <CheckboxButton
          type="button"
          $isDone={isDone}
          onClick={handleToggleDone}
          aria-label={isDone ? 'Marquer non fait' : 'Marquer comme fait'}
        >
          <Icon
            name={isDone ? 'check-circle' : 'checkbox-blank-circle-outline'}
            size={20}
          />
        </CheckboxButton>

        <TaskContent>
          {isEditing ? (
            <InlineInput
              ref={inputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <TaskName
              as="span"
              size="sm"
              weight="medium"
              $isDone={isDone}
              onDoubleClick={() => setIsEditing(true)}
              title="Double-cliquez pour renommer"
            >
              {task.name}
            </TaskName>
          )}

          {task.description && (
            <Text as="p" color="muted" size="xs">
              {task.description}
            </Text>
          )}
        </TaskContent>

        {onEdit && (
          <ActionIconButton
            type="button"
            onClick={() => onEdit(task)}
            title="Modifier la tâche"
            aria-label="Modifier la tâche"
          >
            <Icon name="pencil" size={16} />
          </ActionIconButton>
        )}
      </TaskMain>

      <ActionsWrapper>
        {/* Badge d'échéance */}
        {task.dueDate && (
          <DueDateBadge
            $isOverdue={isOverdue}
            title={isOverdue ? 'Tâche en retard' : "Date d'échéance"}
          >
            <Icon
              name={isOverdue ? 'alert-circle-outline' : 'calendar'}
              size={13}
            />
            <span>{DateFormatter.short(task.dueDate)}</span>
          </DueDateBadge>
        )}

        {/* Tag cliquable vers la gestion des tags */}
        {task.tag && (
          <TagPill to="/tags" $color={task.tag.color} title="Voir les tags">
            {task.tag.name}
          </TagPill>
        )}
      </ActionsWrapper>
    </CardWrapper>
  );
};

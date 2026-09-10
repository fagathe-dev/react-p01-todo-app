import { TaskResponse, updateTask } from '@/services/task.api';
import { TagColor, tagColors } from '@/types/app.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const CardWrapper = styled.div<{ $isDone: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: ${({ theme }) => theme.spacing[3]};
  flex: 1;
  min-width: 0;
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

const TagPill = styled.span<{
  $color?: TagColor | null;
}>`
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
`;

export interface TaskCardProps {
  task: TaskResponse;
  onTaskUpdated: (updatedTask: TaskResponse) => void;
  onEdit?: (task: TaskResponse) => void;
}

export const TaskCard = ({ task, onTaskUpdated, onEdit }: TaskCardProps) => {
  const isDone = Boolean(task.is_done);
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
    onTaskUpdated({ ...task, is_done: nextStatus });

    try {
      await updateTask(task.id, { is_done: nextStatus });
    } catch {
      onTaskUpdated({ ...task, is_done: isDone });
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
      </TaskMain>

      {/* Zone d'actions à droite : Tag + Bouton pour ouvrir la modale */}
      <ActionsWrapper>
        {task.tag_name && (
          <TagPill $color={task.tag_color}>
            {task.tag_name}
          </TagPill>
        )}

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
      </ActionsWrapper>
    </CardWrapper>
  );
};

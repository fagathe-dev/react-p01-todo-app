import { createTask, TaskResponse } from '@/services/task.api';
import { Icon } from '@/ui/components/Base/Icon';
import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form<{ $isFocused: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[2.5]} ${theme.spacing[3.5]}`};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid
    ${({ $isFocused, theme }) =>
      $isFocused ? theme.colors.primary.base : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const QuickInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.heading};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const AddButton = styled.button<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'inline-flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2.5]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: #fff;
  background-color: ${({ theme }) => theme.colors.primary.base};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export interface TaskQuickCreateProps {
  onTaskCreated: (task: TaskResponse) => void;
  defaultDueDate?: 'today' | 'tomorrow' | 'this_week' | 'later';
}

export const TaskQuickCreate = ({
  onTaskCreated,
  defaultDueDate,
}: TaskQuickCreateProps) => {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const created = await createTask({
        name: trimmedName,
        due_date: defaultDueDate,
      });

      onTaskCreated(created);
      setName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer $isFocused={isFocused} onSubmit={handleSubmit}>
      <Icon
        name={isFocused ? 'radiobox-blank' : 'plus'}
        size={20}
        color={isFocused ? undefined : '#888'}
      />
      <QuickInput
        type="text"
        placeholder="Ajouter une tâche…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isSubmitting}
      />
      <AddButton
        type="submit"
        $visible={name.trim().length > 0}
        disabled={isSubmitting}
      >
        Ajouter
      </AddButton>
    </FormContainer>
  );
};

// src/pages/todos/components/TodoQuickCreateForm.tsx
import { createTodo } from '@/services/todo.api';
import { Todo } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import React, { useState } from 'react';
import styled from 'styled-components';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Container = styled.form<{ $focused: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2.5]};
  padding: ${({ theme }) => `${theme.spacing[3]}${theme.spacing[3.5]}`};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid
    ${({ $focused, theme }) =>
      $focused ? theme.colors.primary.base : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all 0.15s ease;
`;

const AddCircle = styled.div<{ $focused: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px dashed
    ${({ $focused, theme }) =>
      $focused ? theme.colors.primary.base : theme.colors.text.muted};
  color: ${({ $focused, theme }) =>
    $focused ? theme.colors.primary.base : theme.colors.text.muted};
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.heading};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const AddBtn = styled.button`
  padding: ${({ theme }) => `${theme.spacing[1]}${theme.spacing[3]}`};
  background-color: ${({ theme }) => theme.colors.primary.base};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
`;

export const TodoQuickCreateForm: React.FC<{
  onCreated: (t: Todo) => void;
}> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = name.trim();
    if (!val || loading) return;

    try {
      setLoading(true);
      setError(null);
      const created = await createTodo({ name: val });
      onCreated(created);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Root>
      <Container $focused={focused} onSubmit={handleSubmit}>
        <AddCircle $focused={focused}>
          <Icon name="plus" size={14} />
        </AddCircle>
        <Input
          placeholder="Ajouter une tâche…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
        {name.trim() && (
          <AddBtn type="submit" disabled={loading}>
            Ajouter
          </AddBtn>
        )}
      </Container>
      {error && (
        <Text size="xs" color="danger" style={{ paddingLeft: 4 }}>
          {error}
        </Text>
      )}
    </Root>
  );
};
// src/pages/todos/components/TodoDueDateSelector.tsx
import { DueDateEnum } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { dueDateEnumToIso, isoToDueDateCategory } from '@/utils/dueDate.resolver';
import React from 'react';
import styled from 'styled-components';

const ChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary.base : theme.colors.border.default)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary.subtle : theme.colors.background.body)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary.base : theme.colors.text.muted)};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const OPTIONS: Array<{ key: DueDateEnum; label: string; icon: string }> = [
  { key: 'today', label: "Aujourd'hui", icon: 'calendar-today' },
  { key: 'tomorrow', label: 'Demain', icon: 'calendar-arrow-right' },
  { key: 'this_week', label: 'Cette semaine', icon: 'calendar-week' },
  { key: 'later', label: 'Plus tard', icon: 'calendar-clock' },
];

export const TodoDueDateSelector: React.FC<{
  dueDate: string | null;
  onChange: (isoDate: string | null) => void;
}> = ({ dueDate, onChange }) => {
  const currentCategory = isoToDueDateCategory(dueDate);

  const handleToggle = (key: DueDateEnum) => {
    if (currentCategory === key) {
      onChange(null);
    } else {
      onChange(dueDateEnumToIso(key));
    }
  };

  return (
    <ChipsGroup>
      {OPTIONS.map(({ key, label, icon }) => (
        <Chip
          key={key}
          type="button"
          $active={currentCategory === key}
          onClick={() => handleToggle(key)}
        >
          <Icon name={icon} size={13} />
          <span>{label}</span>
        </Chip>
      ))}
    </ChipsGroup>
  );
};
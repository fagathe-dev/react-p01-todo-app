// src/pages/todos/components/TagSelectDropdown.tsx
import { ColorEnum, Tag, tagColors } from '@/types/tag.types';
import { Icon } from '@/ui/components/Base/Icon';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.button<{ $hasValue: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[2.5]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  background-color: ${({ theme }) => theme.colors.background.body};
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.text.heading : theme.colors.text.muted};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`;

const Pill = styled.span<{ $bg: string }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  flex-shrink: 0;
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1100;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  max-height: 180px;
  overflow-y: auto;
`;

const Item = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2.5]}`};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.surfaceActive : 'transparent'};
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
  }
`;

export const TagSelectDropdown: React.FC<{
  tags: Tag[];
  value?: string | null;
  onChange: (id: string | null) => void;
}> = ({ tags, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = useMemo(
    () => tags.find((t) => t.id === value),
    [tags, value]
  );

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [open]);

  const getColor = (c?: ColorEnum | null) =>
    c && tagColors[c] ? tagColors[c] : tagColors.blue;

  return (
    <Container ref={ref}>
      <Trigger
        type="button"
        $hasValue={Boolean(selected)}
        onClick={() => setOpen(!open)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selected ? (
            <>
              <Pill $bg={getColor(selected.color)} />
              <span>{selected.name}</span>
            </>
          ) : (
            <span>Associer un tag…</span>
          )}
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
      </Trigger>

      {open && (
        <Menu>
          {value && (
            <Item
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Icon name="close" size={12} color="#e7000b" />
              <span style={{ color: '#e7000b' }}>Retirer le tag</span>
            </Item>
          )}
          {tags.map((t) => (
            <Item
              key={t.id}
              type="button"
              $active={t.id === value}
              onClick={() => {
                onChange(t.id);
                setOpen(false);
              }}
            >
              <Pill $bg={getColor(t.color)} />
              <span>{t.name}</span>
            </Item>
          ))}
        </Menu>
      )}
    </Container>
  );
};

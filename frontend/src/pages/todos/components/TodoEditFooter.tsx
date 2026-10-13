import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { DateFormatter } from 'core-ts';
import React from 'react';
import styled from 'styled-components';

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  margin-top: auto;
`;

const CollapseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.danger?.base || '#e7000b'};
  }
`;

export const TodoEditFooter: React.FC<{
  createdAt?: string | null;
  onClose: () => void;
  onDelete: () => void;
}> = ({ createdAt, onClose, onDelete }) => (
  <Footer>
    <CollapseBtn
      type="button"
      onClick={onClose}
      title="Masquer le volet des détails"
    >
      <Icon name="chevron-right" size={18} />
    </CollapseBtn>

    {createdAt ? (
      <Text size="xs" color="muted">
        Créée le {DateFormatter.short(createdAt)}
      </Text>
    ) : (
      <span />
    )}

    <DeleteBtn type="button" onClick={onDelete} title="Supprimer la tâche">
      <Icon name="trash-can-outline" size={16} />
    </DeleteBtn>
  </Footer>
);

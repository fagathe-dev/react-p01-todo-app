// src/pages/todos/components/TodoCommentCard.tsx
import { TodoComment } from '@/types/todo.types';
import { Avatar } from '@/ui/components/Base/Avatar';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { DateFormatter } from 'core-ts';
import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => theme.spacing[2.5]};
  background-color: ${({ theme }) => theme.colors.background.body};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.danger?.base || '#e7000b'};
  }
`;

export const TodoCommentCard: React.FC<{
  comment: TodoComment;
  onDelete: (id: string) => void;
}> = ({ comment, onDelete }) => (
  <Box>
    <Header>
      <UserInfo>
        <Avatar
          name={comment.owner?.username || 'U'}
          src={comment.owner?.avatar || undefined}
          size="sm"
        />
        <Text size="xs" weight="semibold">
          {comment.owner?.username || 'Moi'}
        </Text>
        {comment.createdAt && (
          <Text size="xs" color="muted">
            · {DateFormatter.short(comment.createdAt)}
          </Text>
        )}
      </UserInfo>
      <DeleteBtn
        type="button"
        onClick={() => onDelete(comment.id)}
        title="Supprimer le commentaire"
      >
        <Icon name="close" size={14} />
      </DeleteBtn>
    </Header>
    <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
      {comment.content}
    </Text>
  </Box>
);

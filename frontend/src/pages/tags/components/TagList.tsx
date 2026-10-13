import { Tag } from '@/types/tag.types';
import { Text } from '@/ui/components/Typo/Text';
import React from 'react';
import styled from 'styled-components';
import { TagListItem } from './TagListItem';

const ListContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.surface};
`;

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete }) => {
  if (tags.length === 0) {
    return (
      <Text color="muted" size="sm">
        Aucun tag créé pour l'instant.
      </Text>
    );
  }

  return (
    <ListContainer>
      {tags.map((tag) => (
        <TagListItem
          key={tag.id}
          tag={tag}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ListContainer>
  );
};

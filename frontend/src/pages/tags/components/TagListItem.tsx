import { ColorEnum, Tag } from '@/types/tag.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import React from 'react';
import styled from 'styled-components';
import { TagPill } from './TagPill';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  gap: ${({ theme }) => theme.spacing[3]};

  &:last-child {
    border-bottom: none;
  }
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  flex: 1;
  min-width: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface TagListItemProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
}

export const TagListItem: React.FC<TagListItemProps> = ({
  tag,
  onEdit,
  onDelete,
}) => {
  return (
    <Row>
      <Info>
        <TagPill $color={(tag.color as ColorEnum) || 'blue'}>
          {tag.name}
        </TagPill>
        {tag.description && (
          <Text size="xs" color="muted">
            {tag.description}
          </Text>
        )}
      </Info>
      <Actions>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onEdit(tag)}
          aria-label="Modifier le tag"
        >
          <Icon name="pencil" size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onDelete(tag.id)}
          aria-label="Supprimer le tag"
        >
          <Icon name="trash-can-outline" size={16} />
        </Button>
      </Actions>
    </Row>
  );
};

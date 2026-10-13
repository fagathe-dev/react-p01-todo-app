import { ColorEnum, Tag, tagColors } from '@/types/tag.types';
import { Icon } from '@/ui/components/Base/Icon';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

const TagPillButton = styled.button<{ $color?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ $color }) => ($color ? `${tagColors[$color as keyof typeof tagColors]}25` : '#88888825')};
  color: ${({ $color }) => ($color ? tagColors[$color as keyof typeof tagColors] : '#888')};
  border: 1px solid ${({ $color }) => ($color ? `${tagColors[$color as keyof typeof tagColors]}50` : '#88888850')};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

const PillDot = styled.span<{ $bg: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  flex-shrink: 0;
`;

const Popup = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 20;
  padding: 8px;
`;

const TagMenu = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 180px;
  overflow-y: auto;
  min-width: 180px;
  gap: 2px;
`;

const TagMenuItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.background.surfaceActive : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
  }
`;

interface NoteModalTagPickerProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NoteModalTagPicker: React.FC<NoteModalTagPickerProps> = ({
  tags,
  selectedTagId,
  onSelectTag,
  isOpen,
  onToggle,
  onClose,
}) => {
  const selectedTag = tags.find((t) => t.id === selectedTagId);
  const getTagColor = (c?: ColorEnum | null) => (c && tagColors[c] ? tagColors[c] : tagColors.blue);

  return (
    <Wrapper onClick={(e) => e.stopPropagation()}>
      {selectedTag ? (
        <TagPillButton type="button" $color={selectedTag.color} onClick={onToggle}>
          <PillDot $bg={getTagColor(selectedTag.color)} />
          <span>{selectedTag.name}</span>
        </TagPillButton>
      ) : (
        <IconButton type="button" onClick={onToggle} title="Associer un tag">
          <Icon name="tag-outline" size={17} />
        </IconButton>
      )}

      {isOpen && (
        <Popup>
          <TagMenu>
            {selectedTagId && (
              <TagMenuItem
                type="button"
                onClick={() => {
                  onSelectTag(null);
                  onClose();
                }}
                style={{ color: '#e7000b' }}
              >
                <Icon name="close" size={12} color="#e7000b" />
                <span>Retirer le tag</span>
              </TagMenuItem>
            )}
            {tags.map((t) => (
              <TagMenuItem
                key={t.id}
                type="button"
                $active={t.id === selectedTagId}
                onClick={() => {
                  onSelectTag(t.id);
                  onClose();
                }}
              >
                <PillDot $bg={getTagColor(t.color)} />
                <span>{t.name}</span>
              </TagMenuItem>
            ))}
          </TagMenu>
        </Popup>
      )}
    </Wrapper>
  );
};

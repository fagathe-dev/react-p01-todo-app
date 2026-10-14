import { ColorEnum, Tag, tagColors } from '@/types/tag.types';
import { Icon } from '@/ui/components/Base/Icon';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const TriggerPill = styled.button<{ $color?: ColorEnum | null }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: ${({ $color }) =>
    $color && tagColors[$color] ? `1px solid ${tagColors[$color]}55` : 'none'};
  background-color: ${({ $color, theme }) =>
    $color && tagColors[$color]
      ? `${tagColors[$color]}20`
      : theme.colors.background.surfaceHover || '#f4f4f5'};
  color: ${({ $color, theme }) =>
    $color && tagColors[$color] ? tagColors[$color] : theme.colors.text.heading};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.88;
  }
`;

const PillDot = styled.span<{ $bg: string }>`
  width: 9px;
  height: 9px;
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
  z-index: 30;
  padding: 8px;
`;

const TagMenu = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  min-width: 190px;
  gap: 2px;
`;

const TagMenuItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: none;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.surfaceActive : 'transparent'};
  color: ${({ theme }) => theme.colors.text.body};
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
  }
`;

interface JournalTagPickerProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const JournalTagPicker: React.FC<JournalTagPickerProps> = ({
  tags,
  selectedTagId,
  onSelectTag,
  isOpen,
  onToggle,
  onClose,
}) => {
  const selectedTag = tags.find((t) => t.id === selectedTagId);
  const getTagColor = (c?: ColorEnum | null) =>
    c && tagColors[c] ? tagColors[c] : tagColors.blue;

  return (
    <Wrapper onClick={(e) => e.stopPropagation()}>
      <TriggerPill
        type="button"
        $color={selectedTag?.color}
        onClick={onToggle}
        title="Choisir une catégorie"
      >
        {selectedTag ? (
          <>
            <PillDot $bg={getTagColor(selectedTag.color)} />
            <span>{selectedTag.name}</span>
          </>
        ) : (
          <>
            <Icon name="tag-outline" size={16} />
            <span>Catégorie</span>
          </>
        )}
      </TriggerPill>

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
                <Icon name="close" size={13} color="#e7000b" />
                <span>Retirer la catégorie</span>
              </TagMenuItem>
            )}

            {tags.length === 0 ? (
              <span style={{ fontSize: 12, color: '#888', padding: '6px 10px' }}>
                Aucune catégorie disponible
              </span>
            ) : (
              tags.map((t) => (
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
              ))
            )}
          </TagMenu>
        </Popup>
      )}
    </Wrapper>
  );
};
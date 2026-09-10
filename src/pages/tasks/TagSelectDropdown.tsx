import { TagColor, tagColors, TaskTag } from '@/types/app.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TriggerButton = styled.button<{ $hasValue: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[2.5]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  background-color: ${({ theme }) => theme.colors.background.surface};
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.text.heading : theme.colors.text.muted};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary.base};
    outline: none;
  }
`;

const TriggerContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0;
`;

const ColorPill = styled.span<{ $bg: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1100;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.body};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.heading};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const TagList = styled.div`
  max-height: 210px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const TagItem = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.background.surfaceActive : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  gap: ${({ theme }) => theme.spacing[2]};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
  }
`;

const TagItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2.5]};
  min-width: 0;
  flex: 1;
`;

const ClearItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.surfaceHover};
    color: ${({ theme }) => theme.colors.danger?.base || '#e7000b'};
  }
`;

const EmptyState = styled(Text)`
  padding: ${({ theme }) => theme.spacing[3]};
  text-align: center;
  font-style: italic;
`;

export interface TagSelectDropdownProps {
  tags: TaskTag[];
  value?: string | null;
  onChange: (tagId: string | null) => void;
}

export const TagSelectDropdown = ({
  tags,
  value,
  onChange,
}: TagSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === value),
    [tags, value]
  );

  // Fermeture au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus immédiat sur l'input de filtre à l'ouverture (comportement GitHub)
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredTags = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, search]);

  const handleSelect = (tagId: string) => {
    // Si on reclique sur le même, on désélectionne
    onChange(tagId === value ? null : tagId);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearch('');
  };

  const getColorHex = (c?: TagColor | null) =>
    c && tagColors[c] ? tagColors[c] : tagColors.blue;

  return (
    <DropdownContainer ref={containerRef}>
      <TriggerButton
        type="button"
        $hasValue={Boolean(selectedTag)}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <TriggerContent>
          {selectedTag ? (
            <>
              <ColorPill $bg={getColorHex(selectedTag.color)} />
              <Text as="span" size="sm" weight="medium">
                {selectedTag.name}
              </Text>
            </>
          ) : (
            <Text as="span" size="sm" color="muted">
              Choisir un tag…
            </Text>
          )}
        </TriggerContent>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} />
      </TriggerButton>

      {isOpen && (
        <DropdownMenu role="listbox">
          <SearchHeader>
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder="Filtrer les tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
            />
          </SearchHeader>

          {value && (
            <ClearItem type="button" onClick={handleClear}>
              <Icon name="close" size={14} />
              <span>Retirer le tag actuel</span>
            </ClearItem>
          )}

          <TagList>
            {filteredTags.length === 0 ? (
              <EmptyState size="xs" color="muted">
                Aucun tag correspondant
              </EmptyState>
            ) : (
              filteredTags.map((tag) => {
                const isSelected = tag.id === value;
                return (
                  <TagItem
                    key={tag.id}
                    type="button"
                    $isSelected={isSelected}
                    onClick={() => handleSelect(tag.id)}
                  >
                    <TagItemContent>
                      <ColorPill $bg={getColorHex(tag.color)} />
                      <Text as="span" size="sm">
                        {tag.name}
                      </Text>
                    </TagItemContent>

                    {isSelected && (
                      <Icon name="check" size={16} color={tagColors.blue} />
                    )}
                  </TagItem>
                );
              })
            )}
          </TagList>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

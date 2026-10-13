import { ColorEnum, tagColors } from '@/types/tag.types';
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

const PaletteGrid = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Swatch = styled.button<{ $bg: string; $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.text.heading : 'transparent')};
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }
`;

interface NoteModalColorPickerProps {
  selectedColor: ColorEnum | null;
  onSelectColor: (color: ColorEnum | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NoteModalColorPicker: React.FC<NoteModalColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  isOpen,
  onToggle,
  onClose,
}) => (
  <Wrapper onClick={(e) => e.stopPropagation()}>
    <IconButton type="button" onClick={onToggle} title="Modifier la couleur">
      <Icon name="palette-outline" size={17} />
    </IconButton>

    {isOpen && (
      <Popup>
        <PaletteGrid>
          <Swatch
            type="button"
            $bg="#ffffff"
            $selected={selectedColor === null}
            onClick={() => {
              onSelectColor(null);
              onClose();
            }}
            title="Défaut"
            style={{
              border: selectedColor === null ? '2px solid #000' : '1px solid #ccc',
            }}
          />
          {(Object.keys(tagColors) as ColorEnum[]).map((c) => (
            <Swatch
              key={c}
              type="button"
              $bg={tagColors[c]}
              $selected={selectedColor === c}
              onClick={() => {
                onSelectColor(c);
                onClose();
              }}
              title={c}
            />
          ))}
        </PaletteGrid>
      </Popup>
    )}
  </Wrapper>
);

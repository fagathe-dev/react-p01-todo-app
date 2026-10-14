import { ColorEnum, tagColors } from '@/types/tag.types';
import { Icon } from '@/ui/components/Base/Icon';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  border-radius: 8px;
`;

const TriggerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const ColorCircle = styled.span<{ $color?: ColorEnum | null }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${({ $color }) => ($color && tagColors[$color] ? `${tagColors[$color]}35` : 'rgba(0, 0, 0, 0.08)')};
  color: ${({ $color, theme }) => ($color && tagColors[$color] ? tagColors[$color] : theme.colors.text.heading)};
  transition: all 0.15s ease;
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

const PaletteGrid = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Swatch = styled.button<{ $bg: string; $selected: boolean }>`
  width: 22px;
  height: 22px;
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

interface JournalColorPickerProps {
  selectedColor: ColorEnum | null;
  onSelectColor: (color: ColorEnum | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const JournalColorPicker: React.FC<JournalColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  isOpen,
  onToggle,
  onClose,
}) => (
  <Wrapper onClick={(e) => e.stopPropagation()}>
    <TriggerBtn type="button" onClick={onToggle} title="Couleur de l'entrée">
      <ColorCircle $color={selectedColor}>
        <Icon name="palette-outline" size={16} />
      </ColorCircle>
    </TriggerBtn>

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
            title="Par défaut"
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

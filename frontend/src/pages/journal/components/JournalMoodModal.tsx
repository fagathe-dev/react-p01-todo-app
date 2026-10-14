import { MOOD_META, MoodEnum } from '@/types/journal.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Title } from '@/ui/components/Typo/Title';
import React from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const ModalBox = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-radius: 12px;
  padding: 20px 24px;
  width: 100%;
  max-width: 390px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
`;

const EmojiBtn = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid ${({ $selected, theme }) => ($selected ? theme.colors.border.default || '#6b7280' : 'transparent')};
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.background.surfaceHover || '#f3f4f6' : 'transparent'};
  border-radius: 10px;
  font-size: 26px;
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.12s ease,
    background-color 0.12s ease;

  &:hover {
    transform: scale(1.12);
    background-color: ${({ theme }) => theme.colors.background.surfaceHover || '#f3f4f6'};
  }
`;

interface JournalMoodModalProps {
  selected?: MoodEnum | null;
  onSelect: (mood: MoodEnum | null) => void;
  onClose: () => void;
}

export const JournalMoodModal: React.FC<JournalMoodModalProps> = ({ selected, onSelect, onClose }) => (
  <Backdrop onClick={onClose}>
    <ModalBox onClick={(e) => e.stopPropagation()}>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="emoticon-happy-outline" size={20} />
          <Title as="h4" style={{ margin: 0 }}>
            Mood
          </Title>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Icon name="close" size={20} />
        </button>
      </Header>

      <EmojiGrid>
        {(Object.keys(MOOD_META) as MoodEnum[]).map((key) => {
          const { emoji, label } = MOOD_META[key];
          const isSelected = selected === key;

          return (
            <EmojiBtn
              key={key}
              type="button"
              $selected={isSelected}
              title={label}
              aria-pressed={isSelected}
              onClick={() => {
                onSelect(isSelected ? null : key);
                onClose();
              }}
            >
              {emoji}
            </EmojiBtn>
          );
        })}
      </EmojiGrid>
    </ModalBox>
  </Backdrop>
);

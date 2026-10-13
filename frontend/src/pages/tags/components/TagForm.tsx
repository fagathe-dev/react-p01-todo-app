import { ColorEnum, CreateTagPayload, tagColors } from '@/types/tag.types';
import { Button } from '@/ui/components/Base/Button';
import { TextField } from '@/ui/components/Forms/Fields/TextField';
import { Text } from '@/ui/components/Typo/Text';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TagPill } from './TagPill';

const FormBox = styled.form`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ColorPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

const ColorSwatch = styled.button<{ $bg: string; $selected: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.text.heading : 'transparent'};
  background-color: ${({ $bg }) => $bg};
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }
`;

interface TagFormProps {
  initialData?: CreateTagPayload | null;
  onSubmit: (data: CreateTagPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TagForm: React.FC<TagFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ColorEnum>('blue');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setColor(initialData.color);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      color,
    });
  };

  return (
    <FormBox onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Text size="xs" weight="medium" color="muted">
          Aperçu :
        </Text>
        <TagPill $color={color}>{name.trim() ? name : 'Nom du tag'}</TagPill>
      </div>

      <FormGrid>
        <TextField
          label="Nom du tag"
          placeholder="ex : Urgence, Maison…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Description"
          placeholder="Utilité de ce tag (facultatif)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormGrid>

      <div>
        <Text size="xs" weight="medium" style={{ marginBottom: 6 }}>
          Couleur :
        </Text>
        <ColorPalette>
          {(Object.keys(tagColors) as ColorEnum[]).map((c) => (
            <ColorSwatch
              key={c}
              type="button"
              $bg={tagColors[c]}
              $selected={color === c}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </ColorPalette>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Mettre à jour' : 'Créer le tag'}
        </Button>
      </div>
    </FormBox>
  );
};

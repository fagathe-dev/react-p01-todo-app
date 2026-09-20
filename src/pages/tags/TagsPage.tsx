import { createTag, deleteTag, fetchTags, updateTag } from '@/services/tag.api';
import { TagColorEnum, tagColors, TaskTag } from '@/types/app.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { Loading } from '@/ui/components/Feedback/Loading';
import { TextField } from '@/ui/components/Forms/Fields/TextField';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TagBadge = styled.span<{ $color: TagColorEnum }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  background-color: ${({ $color }) => `${tagColors[$color]}18`};
  color: ${({ $color }) => tagColors[$color]};
  border: 1px solid ${({ $color }) => `${tagColors[$color]}40`};
  white-space: nowrap;
`;

const FormBox = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
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

const TagListTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.surface};
`;

const TagRow = styled.div`
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

const TagInfo = styled.div`
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const TagsPage = () => {
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Formulaire d'édition / création
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<TagColorEnum>('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTags();
      setTags(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('blue');
    setIsCreating(false);
    setEditingTagId(null);
  };

  const startEdit = (tag: TaskTag) => {
    setIsCreating(false);
    setEditingTagId(tag.id);
    setName(tag.name);
    setDescription(tag.description || '');
    setColor(tag.color as TagColorEnum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (editingTagId) {
        await updateTag(editingTagId, {
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
      } else {
        await createTag({
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
      }
      await loadTags();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer définitivement ce tag ?')) return;
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <HeaderRow>
        <div>
          <Title as="h2">Gestion des tags</Title>
          <Text color="muted" size="sm">
            Organisez vos tâches avec des critères de tri personnalisés
          </Text>
        </div>

        {!isCreating && !editingTagId && (
          <Button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
          >
            Nouveau tag
          </Button>
        )}
      </HeaderRow>

      {/* Formulaire de création / édition */}
      {(isCreating || editingTagId) && (
        <FormBox as="form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Text size="xs" weight="medium" color="muted">
              Aperçu :
            </Text>
            <TagBadge $color={color}>
              {name.trim() ? name : 'Nom du tag'}
            </TagBadge>
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
              {(Object.keys(tagColors) as TagColorEnum[]).map((c) => (
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
            <Button variant="ghost" type="button" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingTagId ? 'Mettre à jour' : 'Créer le tag'}
            </Button>
          </div>
        </FormBox>
      )}

      {/* Liste des tags existants */}
      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 160 }}>
          <Loading size="lg" />
        </div>
      ) : tags.length === 0 ? (
        <Text color="muted" size="sm">
          Aucun tag créé pour l'instant.
        </Text>
      ) : (
        <TagListTable>
          {tags.map((tag) => (
            <TagRow key={tag.id}>
              <TagInfo>
                <TagBadge $color={tag.color as TagColorEnum}>
                  {tag.name}
                </TagBadge>
                {tag.description && (
                  <Text size="xs" color="muted">
                    {tag.description}
                  </Text>
                )}
              </TagInfo>

              <Actions>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => startEdit(tag)}
                  aria-label="Modifier le tag"
                >
                  <Icon name="pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => handleDelete(tag.id)}
                  aria-label="Supprimer le tag"
                >
                  <Icon name="trash-can-outline" size={16} />
                </Button>
              </Actions>
            </TagRow>
          ))}
        </TagListTable>
      )}
    </Container>
  );
};

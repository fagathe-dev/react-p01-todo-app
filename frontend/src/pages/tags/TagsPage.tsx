import { createTag, deleteTag, fetchTags, updateTag } from '@/services/tag.api';
import { CreateTagPayload, Tag } from '@/types/tag.types';
import { Button } from '@/ui/components/Base/Button';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TagForm, TagList } from './components';

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

export const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTags();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingTag(null);
  };

  const handleSubmit = async (data: CreateTagPayload) => {
    try {
      setIsSubmitting(true);
      if (editingTag) {
        await updateTag(editingTag.id, data);
      } else {
        await createTag(data);
      }
      await loadTags();
      handleCancelForm();
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

        {!isCreating && !editingTag && (
          <Button type="button" onClick={() => setIsCreating(true)}>
            Nouveau tag
          </Button>
        )}
      </HeaderRow>

      {/* Formulaire visible si on crée ou on édite */}
      {(isCreating || editingTag) && (
        <TagForm
          initialData={
            editingTag
              ? {
                  name: editingTag.name,
                  description: editingTag.description,
                  color: editingTag.color || 'blue',
                }
              : null
          }
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Liste des tags */}
      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 160 }}>
          <Loading size="lg" />
        </div>
      ) : (
        <TagList
          tags={tags}
          onEdit={setEditingTag}
          onDelete={handleDelete}
        />
      )}
    </Container>
  );
};
// src/pages/todos/components/TodoEditForm.tsx
import { TagSelectDropdown } from '@/pages/tags/components';
import { fetchTags } from '@/services/tag.api';
import {
  addTodoComment,
  deleteTodoComment,
  deleteTodoFile,
  updateTodo,
} from '@/services/todo.api';
import { Tag } from '@/types/tag.types';
import { Todo, UpdateTodoPayload } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Alert } from '@/ui/components/Feedback/Alert';
import { Text } from '@/ui/components/Typo/Text';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TodoCommentCard } from './TodoCommentCard';
import { TodoCommentForm } from './TodoCommentForm';
import { TodoDueDateSelector } from './TodoDueDateSelector';
import { TodoEditFooter } from './TodoEditFooter';
import { TodoFileList } from './TodoFileList';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Drawer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1060;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[4]};
  gap: ${({ theme }) => theme.spacing[3]};
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 100%;
    left: 0;
    height: 100dvh;
    border-left: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const TitleInput = styled.input`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  outline: none;
  color: ${({ theme }) => theme.colors.text.heading};
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => theme.spacing[2.5]};
  background-color: ${({ theme }) => theme.colors.background.body};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.heading};
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

export const TodoEditForm: React.FC<{
  todo: Todo;
  onClose: () => void;
  onUpdated: (t: Todo) => void;
  onDelete: (id: string) => void;
}> = ({ todo, onClose, onUpdated, onDelete }) => {
  const [name, setName] = useState(todo.name);
  const [desc, setDesc] = useState(todo.description || '');
  const [tags, setTags] = useState<Tag[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(todo.name);
    setDesc(todo.description || '');
    setErrorMessage(null);
  }, [todo.id]);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  const save = async (payload: UpdateTodoPayload) => {
    try {
      setErrorMessage(null);
      const updated = await updateTodo(todo.id, payload);
      onUpdated(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.'
      );
    }
  };

  const handleUpload = async (files: FileList) => {
    try {
      setErrorMessage(null);
      const data = new FormData();
      Array.from(files).forEach((f) => data.append('files[]', f));
      const updated = await updateTodo(todo.id, data);
      onUpdated(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'upload du fichier."
      );
    }
  };

  const handleDeleteFile = async (fId: string) => {
    try {
      setErrorMessage(null);
      await deleteTodoFile(todo.id, fId);
      onUpdated({
        ...todo,
        files: (todo.files || []).filter((f) => f.id !== fId),
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer le fichier.'
      );
    }
  };

  const handleAddComment = async (txt: string) => {
    try {
      setErrorMessage(null);
      const added = await addTodoComment(todo.id, txt);
      onUpdated({
        ...todo,
        comments: [...(todo.comments || []), added],
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Impossible d'ajouter le commentaire."
      );
    }
  };

  const handleDeleteComment = async (cId: string) => {
    try {
      setErrorMessage(null);
      await deleteTodoComment(todo.id, cId);
      onUpdated({
        ...todo,
        comments: (todo.comments || []).filter((x) => x.id !== cId),
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer le commentaire.'
      );
    }
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <Drawer>
        <Header>
          <Text size="xs" weight="semibold" color="muted">
            Détails de la tâche
          </Text>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="close" size={18} />
          </button>
        </Header>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <TitleInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() =>
            name.trim() !== todo.name && save({ name: name.trim() })
          }
        />

        <Textarea
          placeholder="Ajouter une note ou description…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={() =>
            desc !== (todo.description || '') &&
            save({ description: desc || null })
          }
        />

        <div>
          <Text size="xs" weight="semibold" style={{ marginBottom: 6 }}>
            Échéance
          </Text>
          <TodoDueDateSelector
            dueDate={todo.dueDate}
            onChange={(dueDate) => save({ dueDate })}
          />
        </div>

        <div>
          <Text size="xs" weight="semibold" style={{ marginBottom: 6 }}>
            Tag
          </Text>
          <TagSelectDropdown
            tags={tags}
            value={todo.tag?.id}
            onChange={(tag) => save({ tag })}
          />
        </div>

        <div>
          <Text size="xs" weight="semibold" style={{ marginBottom: 6 }}>
            Fichiers joints
          </Text>
          <TodoFileList
            todoId={todo.id}
            files={todo.files || []}
            onUpload={handleUpload}
            onFileDeleted={handleDeleteFile}
          />
        </div>

        <div>
          <Text size="xs" weight="semibold" style={{ marginBottom: 6 }}>
            Commentaires
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(todo.comments || []).map((c) => (
              <TodoCommentCard
                key={c.id}
                comment={c}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
          <TodoCommentForm onSubmit={handleAddComment} />
        </div>

        <TodoEditFooter
          createdAt={todo.createdAt}
          onClose={onClose}
          onDelete={() => onDelete(todo.id)}
        />
      </Drawer>
    </>
  );
};

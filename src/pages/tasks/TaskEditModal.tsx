import { fetchTags } from '@/services/tag.api';
import { TaskResponse, updateTask } from '@/services/task.api';
import { DueDateEnum, TaskTag } from '@/types/app.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { TextField } from '@/ui/components/Forms/Fields/TextField';
import { Text } from '@/ui/components/Typo/Text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { z } from 'zod';
import { TagSelectDropdown } from './TagSelectDropdown';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const ModalCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: visible;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[3.5]} ${theme.spacing[4]}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

const ModalBody = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const FieldLabel = styled(Text)`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[2.5]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  background-color: ${({ theme }) => theme.colors.background.surface};
  color: ${({ theme }) => theme.colors.text.heading};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  resize: vertical;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const ChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ChipButton = styled.button<{ $isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[3]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary.base : theme.colors.border.default};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected
      ? theme.colors.primary.subtle
      : theme.colors.background.surface};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary.base : theme.colors.text.muted};
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.body};
`;

const DUE_DATE_OPTIONS: Array<{
  key: DueDateEnum;
  label: string;
  icon: string;
}> = [
  { key: 'today', label: "Aujourd'hui", icon: 'calendar-today' },
  { key: 'tomorrow', label: 'Demain', icon: 'calendar-arrow-right' },
  { key: 'this_week', label: 'Cette semaine', icon: 'calendar-week' },
  { key: 'later', label: 'Plus tard', icon: 'calendar-clock' },
];

const editTaskSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string().optional(),
  dueDate: z
    .enum(['today', 'tomorrow', 'this_week', 'later'])
    .optional()
    .nullable(),
  tag: z.string().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

export interface TaskEditModalProps {
  task: TaskResponse;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: TaskResponse) => void;
}

export const TaskEditModal = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskEditModalProps) => {
  const [tags, setTags] = useState<TaskTag[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || '',
      dueDate: task.dueDate,
      tag: task.tag?.id || '', // Extraction de l'identifiant du tag
    },
  });

  const selectedDueDate = watch('dueDate');
  const selectedTagId = watch('tag');

  useEffect(() => {
    if (isOpen) {
      fetchTags()
        .then(setTags)
        .catch(() => setTags([]));

      reset({
        name: task.name,
        description: task.description || '',
        dueDate: task.dueDate,
        tag: task.tag?.id || '',
      });
    }
  }, [isOpen, task, reset]);

  if (!isOpen) return null;

  const handleToggleDueDate = (key: DueDateEnum) => {
    const nextValue = selectedDueDate === key ? null : key;
    setValue('dueDate', nextValue, { shouldDirty: true });
  };

  const onSubmit = async (data: EditTaskFormData) => {
    const formattedDueDate = data.dueDate ?? null;
    const formattedTagId = data.tag ? data.tag : null;
    const selectedTag = tags.find((t) => t.id === formattedTagId) ?? null;

    try {
      await updateTask(task.id, {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        dueDate: formattedDueDate,
        tag: formattedTagId,
      });

      onTaskUpdated({
        ...task,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        dueDate: formattedDueDate,
        tag: selectedTag, // Assignation de l'objet TaskTag | null
      });

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Backdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Text size="sm" weight="semibold">
            Modifier la tâche
          </Text>
          <ModalCloseButton type="button" onClick={onClose} aria-label="Fermer">
            <Icon name="close" size={18} />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody id="edit-task-form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Nom de la tâche"
            error={errors.name?.message}
            {...register('name')}
          />

          <FieldWrapper>
            <FieldLabel size="xs">Description</FieldLabel>
            <TextArea
              placeholder="Ajouter une note ou description…"
              {...register('description')}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel size="xs">Échéance</FieldLabel>
            <ChipsGroup role="group" aria-label="Sélectionner une échéance">
              {DUE_DATE_OPTIONS.map(({ key, label, icon }) => {
                const isSelected = selectedDueDate === key;
                return (
                  <ChipButton
                    key={key}
                    type="button"
                    $isSelected={isSelected}
                    onClick={() => handleToggleDueDate(key)}
                    aria-pressed={isSelected}
                  >
                    <Icon name={icon} size={14} />
                    <span>{label}</span>
                  </ChipButton>
                );
              })}
            </ChipsGroup>
          </FieldWrapper>

          {tags.length > 0 && (
            <FieldWrapper>
              <FieldLabel size="xs">Tag</FieldLabel>
              <TagSelectDropdown
                tags={tags}
                value={selectedTagId}
                onChange={(newTagId) =>
                  setValue('tag', newTagId || '', { shouldDirty: true })
                }
              />
            </FieldWrapper>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="edit-task-form" loading={isSubmitting}>
            Enregistrer
          </Button>
        </ModalFooter>
      </ModalCard>
    </Backdrop>
  );
};

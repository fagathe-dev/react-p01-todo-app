import { fetchTasks, TaskResponse } from '@/services/task.api';
import { Icon } from '@/ui/components/Base/Icon';
import { Alert } from '@/ui/components/Feedback/Alert';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { TaskCard } from './TaskCard';
import { TaskEditModal } from './TaskEditModal';
import { TaskQuickCreate } from './TaskQuickCreate';
import { Link } from '@/ui/components/Base';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ContentArea = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: ${({ theme }) => theme.spacing[4]};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing[2]};
  background: linear-gradient(
    to top,
    ${({ theme }) => theme.colors.background.body} 70%,
    transparent
  );
`;

const SectionContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[1]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyText = styled(Text)`
  font-style: italic;
  padding: ${({ theme }) => `${theme.spacing[2]} 0`};
`;

const DoneSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const DoneDropdownTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  background: none;
  border: none;
  padding: ${({ theme }) => `${theme.spacing[1.5]} 0`};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.muted};
  user-select: none;
  align-self: flex-start;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

const ChevronIcon = styled(Icon)<{ $isOpen: boolean }>`
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
`;

const DoneTaskList = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

type DueDateKey = 'today' | 'tomorrow' | 'this_week' | 'later';

const SECTION_CONFIG: Array<{
  key: DueDateKey | 'none';
  label: string;
  icon: string;
}> = [
  { key: 'none', label: 'Sans échéance', icon: 'inbox' },
  { key: 'today', label: "Aujourd'hui", icon: 'calendar-today' },
  { key: 'tomorrow', label: 'Demain', icon: 'calendar-arrow-right' },
  { key: 'this_week', label: 'Cette semaine', icon: 'calendar-week' },
  { key: 'later', label: 'Plus tard', icon: 'calendar-clock' },
];

export const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de récupérer les tâches'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleTaskCreated = (newTask: TaskResponse) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: TaskResponse) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const groupedTasks = useMemo(() => {
    const map: Record<DueDateKey | 'none' | 'done', TaskResponse[]> = {
      none: [],
      today: [],
      tomorrow: [],
      this_week: [],
      later: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (Boolean(task.is_done)) {
        map.done.push(task);
      } else if (!task.due_date) {
        map.none.push(task);
      } else if (
        task.due_date === 'today' ||
        task.due_date === 'tomorrow' ||
        task.due_date === 'this_week' ||
        task.due_date === 'later'
      ) {
        map[task.due_date].push(task);
      } else {
        map.later.push(task);
      }
    });

    return map;
  }, [tasks]);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '200px' }}>
        <Loading size="lg" label="Chargement des tâches…" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <PageWrapper>
      <ContentArea>
        <header>
          <Title as="h2">Ma journée</Title>
          <Text as="p" color="muted" size="sm">
            Organisez et planifiez vos priorités
          </Text>
        </header>

        {SECTION_CONFIG.map(({ key, label, icon }) => {
          const sectionTasks = groupedTasks[key];
          if (key !== 'none' && sectionTasks.length === 0) return null;

          return (
            <SectionContainer key={key}>
              <SectionHeader>
                <Icon name={icon} size={18} />
                <Text weight="semibold" size="sm">
                  {label} ({sectionTasks.length})
                </Text>
              </SectionHeader>

              {sectionTasks.length === 0 ? (
                <EmptyText size="sm" color="muted">
                  Aucune tâche dans cette section.
                </EmptyText>
              ) : (
                <TaskList>
                  {sectionTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskUpdated={handleTaskUpdated}
                      onEdit={(taskToEdit) => setEditingTask(taskToEdit)}
                    />
                  ))}
                </TaskList>
              )}
            </SectionContainer>
          );
        })}

        {groupedTasks.done.length > 0 && (
          <DoneSection>
            <DoneDropdownTrigger
              type="button"
              onClick={() => setIsDoneOpen((prev) => !prev)}
              aria-expanded={isDoneOpen}
            >
              <ChevronIcon
                name="chevron-right"
                size={16}
                $isOpen={isDoneOpen}
              />
              <span>Terminées ({groupedTasks.done.length})</span>
            </DoneDropdownTrigger>

            <DoneTaskList $isOpen={isDoneOpen}>
              {groupedTasks.done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onEdit={(taskToEdit) => setEditingTask(taskToEdit)}
                />
              ))}
            </DoneTaskList>
          </DoneSection>
        )}
      </ContentArea>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <BottomBar>
        <TaskQuickCreate onTaskCreated={handleTaskCreated} />
      </BottomBar>
    </PageWrapper>
  );
};

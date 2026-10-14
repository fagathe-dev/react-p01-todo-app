// src/pages/todos/TodoPage.tsx
import { deleteTodo, fetchTodos } from '@/services/todo.api';
import { Todo } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import { DueDateCategory, isoToDueDateCategory } from '@/utils/dueDate.resolver';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { TodoEditForm, TodoList, TodoQuickCreateForm } from './components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  min-height: calc(100vh - 120px);
  width: 100%;
  max-width: 924px;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: ${({ theme }) => theme.spacing[4]};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing[2]};
  background: linear-gradient(to top, ${({ theme }) => theme.colors.background.body} 75%, transparent);
`;

// Ordre requis : En retard -> Échéances proches -> Sans échéance (juste avant terminées)
const SECTIONS: Array<{ key: DueDateCategory; label: string; icon: string }> = [
  { key: 'overdue', label: 'En retard', icon: 'alert-circle' },
  { key: 'today', label: 'Aujourd’hui', icon: 'calendar-today' },
  { key: 'tomorrow', label: 'Demain', icon: 'calendar-arrow-right' },
  { key: 'this_week', label: 'Cette semaine', icon: 'calendar-week' },
  { key: 'later', label: 'Plus tard', icon: 'calendar-clock' },
  { key: 'none', label: 'Sans échéance', icon: 'inbox' },
];

export const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (t: Todo) => {
    setTodos((prev) => prev.map((item) => (item.id === t.id ? t : item)));
    if (selectedTodo?.id === t.id) setSelectedTodo(t);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (selectedTodo?.id === id) setSelectedTodo(null);
  };

  // Typage sécurisé contre ts(2532)
  const grouped = useMemo(() => {
    const map: Record<DueDateCategory | 'done', Todo[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      this_week: [],
      later: [],
      none: [],
      done: [],
    };

    todos.forEach((t) => {
      if (t.isDone) {
        map.done.push(t);
      } else {
        const cat = isoToDueDateCategory(t.dueDate);
        const target = map[cat];
        if (target) {
          target.push(t);
        } else {
          map.none.push(t);
        }
      }
    });

    return map;
  }, [todos]);

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: 200 }}>
        <Loading size="lg" />
      </div>
    );
  }

  const doneList = grouped.done ?? [];

  return (
    <Container>
      <PageHeader>
        <Title as="h2">Ma journée</Title>
        <Text size="xs" color="muted" style={{ textTransform: 'capitalize' }}>
          {todayFormatted}
        </Text>
      </PageHeader>

      {/* Sections actives ordonnées */}
      {SECTIONS.map(({ key, label, icon }) => {
        const list = grouped[key] ?? [];
        if (key !== 'none' && list.length === 0) return null;

        return (
          <div key={key}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Icon name={icon} size={15} color="#888" />
              <Text size="xs" weight="semibold" color="muted">
                {label} ({list.length})
              </Text>
            </div>
            <TodoList todos={list} onTodoUpdated={handleUpdate} onSelectTodo={setSelectedTodo} />
          </div>
        );
      })}

      {/* Tâches terminées tout en bas */}
      {doneList.length > 0 && (
        <div>
          <Text size="xs" weight="semibold" color="muted" style={{ margin: '14px 0 8px' }}>
            Terminées ({doneList.length})
          </Text>
          <TodoList todos={doneList} onTodoUpdated={handleUpdate} onSelectTodo={setSelectedTodo} />
        </div>
      )}

      {/* Volet latéral d'édition au clic */}
      {selectedTodo && (
        <TodoEditForm
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdated={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <BottomBar>
        <TodoQuickCreateForm onCreated={(t) => setTodos((prev) => [t, ...prev])} />
      </BottomBar>
    </Container>
  );
};

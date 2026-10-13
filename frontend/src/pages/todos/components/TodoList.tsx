import { Todo } from '@/types/todo.types';
import React from 'react';
import styled from 'styled-components';
import { TodoCard } from './TodoCard';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface TodoListProps {
  todos: Todo[];
  onTodoUpdated: (t: Todo) => void;
  onSelectTodo: (t: Todo) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onTodoUpdated,
  onSelectTodo,
}) => {
  return (
    <Wrapper>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onTodoUpdated={onTodoUpdated}
          onSelect={onSelectTodo}
        />
      ))}
    </Wrapper>
  );
};

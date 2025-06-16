import React from 'react';
import { Todo } from '../../types/Todo';
import { TodoItem } from './../TodoItem/TodoItem';

type Props = {
  todos: Todo[];
  onUpdate: (id: number, newTitle?: string) => void;
  updatingIds: number[];
  onDelete: (id: number) => void;
  tempTodo: Todo | null;
  loadingIds: number[];
  isAdding: boolean;
  editingTodoId: number | null;
  updateErrorId: number | null;
  onStartEditing: (id: number) => void;
  onCancelEditing: () => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  onUpdate,
  updatingIds,
  onDelete,
  tempTodo,
  loadingIds,
  isAdding,
  editingTodoId,
  updateErrorId,
  onStartEditing,
  onCancelEditing,
}) => (
  <section className="todoapp__main" data-cy="TodoList">
    {todos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onUpdate={onUpdate}
        isUpdating={updatingIds.includes(todo.id)}
        deleteTodo={onDelete}
        isDisabled={loadingIds.includes(todo.id)}
        isLoading={!isAdding && loadingIds.includes(todo.id)}
        isEditing={editingTodoId === todo.id}
        updateError={updateErrorId === todo.id}
        onStartEditing={() => onStartEditing(todo.id)}
        onCancelEditing={onCancelEditing}
      />
    ))}

    {tempTodo && isAdding && (
      <TodoItem
        todo={tempTodo}
        isTemp={true}
        isLoading={true}
        isDisabled={true}
        onUpdate={() => {}}
        deleteTodo={() => {}}
      />
    )}
  </section>
);

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
    {todos.map(todo => {
      const isUpdating = updatingIds.includes(todo.id);
      const isDisabled = loadingIds.includes(todo.id);
      const isLoading = !isAdding && isDisabled;
      const isEditing = editingTodoId === todo.id;
      const updateError = updateErrorId === todo.id;

      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
          deleteTodo={onDelete}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isEditing={isEditing}
          updateError={updateError}
          onStartEditing={() => onStartEditing(todo.id)}
          onCancelEditing={onCancelEditing}
        />
      );
    })}

    {tempTodo && isAdding && (
      <TodoItem todo={tempTodo} isTemp isLoading isDisabled />
    )}
  </section>
);

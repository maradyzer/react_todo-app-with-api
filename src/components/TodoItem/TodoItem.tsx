import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  onUpdate: (id: number, newTitle?: string) => void;
  deleteTodo: (id: number) => void;
  isTemp?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isUpdating?: boolean;
  isEditing?: boolean;
  updateError?: boolean;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onUpdate,
  deleteTodo,
  isTemp = false,
  isDisabled = false,
  isLoading = false,
  isUpdating = false,
  isEditing = false,
  updateError = false,
  onStartEditing,
  onCancelEditing,
}) => {
  const [editedTitle, setEditedTitle] = useState(todo.title);

  useEffect(() => {
    if (isEditing) {
      setEditedTitle(todo.title);
    }
  }, [isEditing, todo.title]);

  const isLoaderVisible = isTemp || isLoading || isUpdating;

  const handleSubmit = () => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle === todo.title) {
      onCancelEditing?.();

      return;
    }

    if (!trimmedTitle) {
      deleteTodo(todo.id);

      return;
    }

    onUpdate(todo.id, trimmedTitle);
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', {
        completed: todo.completed,
        loading: isTemp,
        'is-error': updateError,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          aria-label="Toggle todo status"
          checked={todo.completed}
          onChange={() => onUpdate(todo.id)}
          disabled={isDisabled || isLoading || isUpdating}
        />
      </label>

      {isEditing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            data-cy="TodoTitleField"
            className="todo__title-field"
            value={editedTitle}
            onChange={e => setEditedTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setEditedTitle(todo.title);
                onCancelEditing?.();
              }
            }}
            autoFocus
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => onStartEditing?.()}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(todo.id)}
            disabled={isDisabled}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal', 'overlay', {
          'is-active': isLoaderVisible,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

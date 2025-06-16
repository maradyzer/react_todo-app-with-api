import React from 'react';
import { ToggleAll } from '../ToggleAll/ToggleAll';
import { TodoInput } from '../TodoInput/TodoInput';

type Props = {
  newTodoTitle: string;
  onTitleChange: (title: string) => void;
  onAddTodo: (title: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  allCompleted: boolean;
  handleToggleAll: () => void;
  isDisabled: boolean;
  isAdding: boolean;
  updatingIds: number[];
  todosCount: number;
};

export const Header: React.FC<Props> = ({
  newTodoTitle,
  onTitleChange,
  onAddTodo,
  inputRef,
  allCompleted,
  handleToggleAll,
  isDisabled,
  isAdding,
  updatingIds,
  todosCount,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAddTodo(newTodoTitle);
  };

  return (
    <header className="todoapp__header">
      <ToggleAll
        allCompleted={allCompleted}
        handleToggleAll={handleToggleAll}
        isLoading={isDisabled}
        updatingIds={updatingIds}
        todosCount={todosCount}
      />

      <TodoInput
        newTodoTitle={newTodoTitle}
        onTitleChange={onTitleChange}
        onSubmit={handleSubmit}
        inputRef={inputRef}
        isAdding={isAdding}
      />
    </header>
  );
};

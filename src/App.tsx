import React, { useEffect, useRef, useState } from 'react';
import { getTodos, addTodo, deleteTodo, updateTodo } from './api/todos';
import { Todo } from './types/Todo';
import { TodoFilter } from './types/Filters';
import { ErrorMessage } from './types/ErrorMessage';
import { USER_ID } from './api/todos';
import { UserWarning } from './components/UserWarning/UserWarning';
import { Header } from './components/Header/Header';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { ErrorNotification } from './components/Error/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>(TodoFilter.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [updateErrorId, setUpdateErrorId] = useState<number | null>(null);

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    setIsLoading(true);

    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage(ErrorMessage.LoadTodos))
      .finally(() => setIsLoading(false));
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdding && loadingIds.length === 0) {
      inputRef.current?.focus();
    }
  }, [isAdding, loadingIds]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const handleAddTodo = (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage(ErrorMessage.EmptyTitle);

      return Promise.resolve();
    }

    setIsAdding(true);

    const newTodo = {
      id: 0,
      title: trimmedTitle,
      userId: USER_ID,
      completed: false,
    };

    setTempTodo(newTodo);

    return addTodo(newTodo)
      .then(createdTodo => {
        setTodos(prev => [...prev, createdTodo]);
        setNewTodoTitle('');
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.AddTodo);
      })
      .finally(() => {
        setTempTodo(null);
        setIsAdding(false);
      });
  };

  const handleDeleteTodo = (todoId: number) => {
    setLoadingIds(prev => [...prev, todoId]);

    deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.DeleteTodo);
      })
      .finally(() => {
        setLoadingIds(prev => prev.filter(id => id !== todoId));
      });
  };

  const handleStartEditing = (id: number) => {
    setEditingTodoId(id);
    setUpdateErrorId(null);
  };

  const handleCancelEditing = () => {
    setEditingTodoId(null);
    setUpdateErrorId(null);
  };

  const handleUpdateTodo = async (todoId: number, newTitle?: string) => {
    const todo = todos.find(t => t.id === todoId);

    if (!todo) {
      return;
    }

    if (newTitle !== undefined && newTitle.trim() === '') {
      setUpdatingIds(prev => [...prev, todoId]);
      setErrorMessage(null);

      try {
        await deleteTodo(todoId);
        setTodos(prev => prev.filter(t => t.id !== todoId));
        setEditingTodoId(null);
        setUpdateErrorId(null);
      } catch (error) {
        setErrorMessage(ErrorMessage.DeleteTodo);
        setUpdateErrorId(todoId);
      } finally {
        setUpdatingIds(prev => prev.filter(id => id !== todoId));
      }

      return;
    }

    const updatedFields: Partial<Todo> = {
      completed: newTitle === undefined ? !todo.completed : todo.completed,
    };

    if (newTitle !== undefined) {
      updatedFields.title = newTitle.trim();
    }

    setUpdatingIds(prev => [...prev, todoId]);
    setErrorMessage(null);

    try {
      const updatedTodo = await updateTodo({
        ...todo,
        ...updatedFields,
      });

      setTodos(prev => prev.map(t => (t.id === todoId ? updatedTodo : t)));
      setEditingTodoId(null);
      setUpdateErrorId(null);
    } catch (error) {
      setErrorMessage(ErrorMessage.UpdateTodo);
      setUpdateErrorId(todoId);
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const idsToDelete = completedTodos.map(todo => todo.id);

    const results = await Promise.allSettled(
      idsToDelete.map(id => deleteTodo(id)),
    );

    const successIds: number[] = [];
    let isSomeFailed = false;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successIds.push(idsToDelete[index]);
      } else {
        isSomeFailed = true;
      }
    });

    if (isSomeFailed) {
      setErrorMessage(ErrorMessage.DeleteTodo);
    }

    setTodos(prev => prev.filter(todo => !successIds.includes(todo.id)));

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleToggleAll = async () => {
    const shouldBeCompleted = !todos.every(todo => todo.completed);

    const todosToUpdate = todos.filter(
      todo => todo.completed !== shouldBeCompleted,
    );

    if (todosToUpdate.length === 0) {
      return;
    }

    const idsToUpdate = todosToUpdate.map(todo => todo.id);

    setUpdatingIds(prev => [...prev, ...idsToUpdate]);
    setErrorMessage(null);

    try {
      const updatedTodos = await Promise.all(
        todosToUpdate.map(todo =>
          updateTodo({ ...todo, completed: shouldBeCompleted }),
        ),
      );

      setTodos(prev =>
        prev.map(todo =>
          idsToUpdate.includes(todo.id)
            ? updatedTodos.find(t => t.id === todo.id) || todo
            : todo,
        ),
      );
    } catch {
      setErrorMessage(ErrorMessage.UpdateTodo);
    } finally {
      setUpdatingIds(prev => prev.filter(id => !idsToUpdate.includes(id)));
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case TodoFilter.Active:
        return !todo.completed;
      case TodoFilter.Completed:
        return todo.completed;
      case TodoFilter.All:
      default:
        return true;
    }
  });

  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const hasCompletedTodos = todos.some(todo => todo.completed);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          newTodoTitle={newTodoTitle}
          onTitleChange={setNewTodoTitle}
          onAddTodo={handleAddTodo}
          inputRef={inputRef}
          handleToggleAll={handleToggleAll}
          allCompleted={allCompleted}
          isDisabled={isLoading}
          isAdding={isAdding}
          updatingIds={updatingIds}
          todosCount={todos.length}
        />

        {todos.length > 0 && (
          <>
            <TodoList
              todos={filteredTodos}
              onUpdate={handleUpdateTodo}
              updatingIds={updatingIds}
              onDelete={handleDeleteTodo}
              tempTodo={tempTodo}
              loadingIds={loadingIds}
              isAdding={isAdding}
              editingTodoId={editingTodoId}
              updateErrorId={updateErrorId}
              onStartEditing={handleStartEditing}
              onCancelEditing={handleCancelEditing}
            />

            <Footer
              activeTodosCount={activeTodosCount}
              hasCompletedTodos={hasCompletedTodos}
              clearCompleted={clearCompleted}
              filter={filter}
              setFilter={setFilter}
            />
          </>
        )}
      </div>

      <ErrorNotification
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      {isLoading && <div className="loader" data-cy="LoadingIndicator" />}
    </div>
  );
};

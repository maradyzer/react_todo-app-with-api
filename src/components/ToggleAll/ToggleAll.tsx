import React from 'react';
import cn from 'classnames';

type Props = {
  allCompleted: boolean;
  handleToggleAll: () => void;
  isLoading: boolean;
  updatingIds: number[];
  todosCount: number;
};

export const ToggleAll: React.FC<Props> = ({
  allCompleted,
  handleToggleAll,
  isLoading,
  updatingIds,
  todosCount,
}) => {
  if (todosCount === 0 || isLoading) {
    return null;
  }

  return (
    <button
      type="button"
      className={cn('todoapp__toggle-all', { active: allCompleted })}
      data-cy="ToggleAllButton"
      onClick={handleToggleAll}
      disabled={isLoading || updatingIds.length > 0}
    />
  );
};

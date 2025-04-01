import { useUpdateTodo } from "../functions/Update";
import { useDeleteTodo } from "../functions/Update";

import { Todo } from "../type/Todo";

export default function UpdateTodo({ todo }: { todo: Todo }) {
  const update = useUpdateTodo(todo);
  const deletion = useDeleteTodo(todo.id);

  return (
    <div className="flex justify-end gap-5 mx-5">
      <div className="flex items-center">
        <input
          className=""
          type="checkbox"
          name="isCompleted"
          onClick={() => {
            if (!todo?.id) return;
            update.mutate();
          }}
        />
        <label className="font-semibold" htmlFor="isCompleted">
          {todo.isCompleted ? "Reset" : "Mark as Done"}
        </label>
      </div>
      <button
        className="text-white button"
        onClick={() => {
          if (!todo?.id) return;
          deletion.mutate();
        }}
      >
        {deletion.isPending ? "Deleting..." : "Delete"}
      </button>
      {/* Tampilkan error jika ada */}
      {update.error && <p className="text-red-500">{update.error.message}</p>}
      {deletion.error && (
        <p className="text-red-500">{deletion.error.message}</p>
      )}
    </div>
  );
}

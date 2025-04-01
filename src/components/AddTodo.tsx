import useAddTodo from "../functions/Add";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "../App.css";

const TodoSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: "Please enter a todo item" }),
  description: z.string().optional(),
  isCompleted: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;

export default function AddTodo() {
  const {
    register,
    handleSubmit,
    // setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Todo>({
    defaultValues: { name: "", description: "", isCompleted: false },
    resolver: zodResolver(TodoSchema),
  });
  const add = useAddTodo();
  const addTodo: SubmitHandler<Todo> = async ({ name, description }) => {
    if (!name.trim()) return;
    await add.mutateAsync({
      name,
      description,
      isCompleted: false,
    });
    reset(); // Reset form setelah submit
  };

  return (
    <form
      className="flex flex-col mb-5 px-2 rounded"
      onSubmit={handleSubmit(addTodo)}
    >
      <div className="gap-2 grid sm:grid-cols-1 lg:grid-cols-3 *:py-2">
        <input
          className="border rounded"
          type="text"
          placeholder="New Todo..."
          {...register("name")}
        />
        <input
          className="border rounded"
          type="text"
          placeholder="Description..."
          {...register("description")}
        />
        <button
          className="text-white add-button"
          disabled={isSubmitting || add.isPending}
          type="submit"
        >
          {add.isPending ? `Adding...` : `Add Todo Item`}
        </button>
      </div>
      {errors.name && <div className="text-red-500">{errors.name.message}</div>}
    </form>
  );
}

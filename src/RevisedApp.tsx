import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./App.css";
import supabase from "./supabase-client.ts";

const TodoSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: "Please enter a todo item" }),
  description: z.string().optional(),
  isCompleted: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;

function App() {
  const queryClient = useQueryClient();

  // 🟢 Fetch Todos → Simpan langsung di TanStack Query
  const {
    data: todos,
    isPending,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("TodoList")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error("Error fetching todos");
      return data || [];
    },
    staleTime: 2000, // 2 detik
    refetchOnWindowFocus: true, // Saat user kembali ke tab, refetch
    refetchInterval: 2000, // Setiap 2 detik, refetch otomatis
  });

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

  // 🔵 Mutation untuk Menambah Todo
  const addTodoMutation = useMutation({
    mutationFn: async (newTodo: Omit<Todo, "id">) => {
      const { data, error } = await supabase
        .from("TodoList")
        .insert([newTodo])
        .select("*");
      if (error) throw new Error("Error adding new todo");
      return data?.[0];
    },
    onSuccess: (newTodo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) => [
        newTodo,
        ...(old || []),
      ]);
      reset(); // Reset form setelah submit
    },
  });

  // 🟠 Mutation untuk Update Todo
  const updateTodoMutation = useMutation({
    mutationFn: async (todo: Todo) => {
      await supabase
        .from("TodoList")
        .update({ isCompleted: !todo.isCompleted })
        .eq("id", todo.id);
      return { ...todo, isCompleted: !todo.isCompleted };
    },
    onSuccess: (updatedTodo) => {
      // update data di sisi client
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      // refetch data dari server dan sinkronisasi
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // 🔴 Mutation untuk Hapus Todo

  const handleDelete = (id: number | undefined) => {
    if (id === undefined) {
      console.error("ID is undefined, cannot delete task.");
      return;
    }
    deleteTodoMutation.mutate(id);
  };

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from("TodoList").delete().eq("id", id);
      return id;
    },
    onSuccess: (id) => {
      // update data di sisi client
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((todo) => todo.id !== id)
      );
      // refetch data dari server dan sinkronisasi
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const addTodo: SubmitHandler<Todo> = async ({ name, description }) => {
    if (!name.trim()) return;
    await addTodoMutation.mutateAsync({
      name,
      description,
      isCompleted: false,
    });
  };

  if (isPending) return <h1>Loading...</h1>;
  if (isError) return <pre>{JSON.stringify(error)}</pre>;

  return (
    <div className="px-15 pt-3 pb-12">
      <h1 className="mb-2">ToDo List</h1>

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
            disabled={isSubmitting || addTodoMutation.isPending}
            type="submit"
          >
            {addTodoMutation.isPending ? `Adding...` : `Add Todo Item`}
          </button>
        </div>
        {errors.name && (
          <div className="text-red-500">{errors.name.message}</div>
        )}
      </form>

      <ul>
        {todos &&
          todos.map((todo, index) => (
            <li key={todo.id ?? `temp-${index}`}>
              <div className="my-2 px-5 py-2 pb-4 border rounded-xl">
                <h2 className="ml-5 font-bold text-xl text-left">
                  {todo.name}
                </h2>
                <p className="ml-5 pt-1 text-sm text-left">
                  {todo.description ?? `Description...`}
                </p>
                <div className="flex justify-end gap-5 mx-5">
                  <div className="flex items-center">
                    <input
                      className=""
                      type="checkbox"
                      name="isCompleted"
                      onClick={() => updateTodoMutation.mutate(todo)}
                    />
                    <label className="font-semibold" htmlFor="isCompleted">
                      {todo.isCompleted ? "Reset" : "Mark as Done"}
                    </label>
                  </div>
                  <button
                    className="text-white button"
                    onClick={() => handleDelete(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;

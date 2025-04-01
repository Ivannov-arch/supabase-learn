import { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./App.css";
import supabase from "./supabase-client.ts";

const TodoSchema = z.object({
  id: z.number(),
  name: z.string().min(3, { message: "Please enter a todo item" }),
  isCompleted: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;

function App() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Todo["name"]>("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Todo>({
    defaultValues: {
      name: "",
      isCompleted: false,
    },
    resolver: zodResolver(TodoSchema),
  });

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("TodoList").select("*");
    if (error) {
      setError("root", { message: "Error fetching todos:" });
    } else {
      setTodoList(data);
      return todoList;
    }
  };
  const fetchTodoQuery = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 1000 * 5, // 5 seconds
  });

  const addTodo: SubmitHandler<Todo> = async () => {
    if (!newTodo.trim()) return; // Hindari menambahkan todo kosong
    await addTodoMutation.mutateAsync();
  };

  const addTodoMutation = useMutation({
    mutationFn: async () => {
      const newTodoData = {
        name: newTodo,
        isCompleted: false,
      };
      const { data, error } = await supabase
        .from("TodoList")
        .insert([newTodoData]); // Jangan gunakan `.single()`
      if (error) {
        setError("name", { message: "Error adding new todo" });
      } else {
        if (data) {
          setTodoList([...todoList, data[0]]);
        }
        setNewTodo("");
        fetchTodos();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateTask = async (id: number, isCompleted: boolean) => {
    const { error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      );
      setTodoList(updatedTodoList);
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("TodoList").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      const updatedTodoList = todoList.filter((todo) => todo.id !== id);
      setTodoList(updatedTodoList);
    }
  };

  if (fetchTodoQuery.isLoading) return <h1>Loading...</h1>;
  if (fetchTodoQuery.isError) {
    return <pre>{JSON.stringify(fetchTodoQuery.error)}</pre>;
  }

  return (
    <>
      <div>
        {""}

        <h1>ToDo List</h1>

        <form onSubmit={handleSubmit(addTodo)}>
          <input
            className="border rounded"
            type="text"
            placeholder="New Todo..."
            {...register("name")}
          />
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? `Adding...` : `Add Todo Item`}
          </button>
          {errors.name && (
            <div className="self-start text-red-500">{errors.name.message}</div>
          )}{" "}
          <br /> <br />
          {errors.root && (
            <div className="self-start text-red-500">{errors.root.message}</div>
          )}
        </form>

        <ul>
          {todoList.map((todo) => (
            <li key={todo.id}>
              <p>{todo.name}</p>
              <button onClick={() => updateTask(todo.id, todo.isCompleted)}>
                {todo.isCompleted ? "Undo" : "Done"}
              </button>
              <button onClick={() => deleteTask(todo.id)}>Delete Task</button>
              <br /> <br />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;

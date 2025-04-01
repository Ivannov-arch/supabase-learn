import supabase from "../supabase-client.ts";
import { Todo } from "../type/Todo.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
type newTodo = Omit<Todo, "id">;

const addTodo = async (newTodo: newTodo) => {
  const { data, error } = await supabase
    .from("TodoList")
    .insert([newTodo])
    .select("*");
  if (error) throw new Error("Error adding new todo");
  return data?.[0];
};

export default function useAddTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTodo,
    onSuccess: (newTodo: newTodo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) => [
        newTodo,
        ...(old || []),
      ]);
    },
  });
}

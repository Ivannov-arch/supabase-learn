import { Todo } from "../type/Todo";
import supabase from "../supabase-client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// 🔴 Mutation untuk Hapus Todo
const deleteTodo = async (id: number | undefined) => {
  if (id === undefined) return Promise.reject(new Error("Todo ID is required"));
  await supabase.from("TodoList").delete().eq("id", id);
  return id;
};

export const useDeleteTodo = (id: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTodo(id),
    onSuccess: (id) => {
      // update data di sisi client
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((todo) => todo.id !== id)
      );
      // refetch data dari server dan sinkronisasi
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      console.error("Failed to delete todo:", error);
      alert("Terjadi kesalahan saat menghapus todo.");
    },
  });
};

const updateTodo = async (todo: Todo) => {
  if (!todo.id) return Promise.reject(new Error("Todo ID is required"));

  const { data, error } = await supabase
    .from("TodoList")
    .update({ isCompleted: !todo.isCompleted })
    .eq("id", todo.id)
    .select()
    .single();

  if (error) return Promise.reject(error); // Mengembalikan error sebagai Promise

  return data;
};

export const useUpdateTodo = (todo: Todo) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => updateTodo(todo),
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      queryClient.invalidateQueries({
        queryKey: ["todos"],
        refetchType: "none",
      });
    },
    onError: (error) => {
      console.error("Failed to update todo:", error);
      alert("Terjadi kesalahan saat memperbarui todo.");
    },
  });
};

import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import supabase from "../supabase-client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TodoSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: "Please enter a todo item" }),
  description: z.string().optional(),
  isCompleted: z.boolean(),
});

export type Todo = z.infer<typeof TodoSchema>;

const getTodos = async () => {
  const { data, error } = await supabase
    .from("TodoList")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Error fetching todos");
  return (data as Todo[]) || [];
};

export default function createGetMovieOptions() {
  return queryOptions({
    queryKey: ["todos"],
    queryFn: getTodos,
    staleTime: 2000, // 2 detik
    refetchOnWindowFocus: true, // Saat user kembali ke tab, refetch
    refetchInterval: 2000, // Setiap 2 detik, refetch otomatis
  });
}

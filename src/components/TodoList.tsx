import { useQuery } from "@tanstack/react-query";
import createGetMovieOptions from "../functions/Get";
import UpdateTodo from "./UpdateTodo";

export default function TodoList() {
  const { data, isPending } = useQuery(createGetMovieOptions());
  if (isPending) return <p>Loading...</p>;

  return (
    <>
      <ul>
        {data &&
          data.map((todo, index) => (
            <li key={todo.id ?? `temp-${index}`}>
              <div className="my-2 px-5 py-2 pb-4 border rounded-xl">
                <h2 className="ml-5 font-bold text-xl text-left">
                  {todo.name}
                </h2>
                <p className="ml-5 pt-1 text-sm text-left">
                  {todo.description ?? `Description...`}
                </p>
                <UpdateTodo todo={todo} />
              </div>
            </li>
          ))}
      </ul>
    </>
  );
}

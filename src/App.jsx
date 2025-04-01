import { useEffect, useState } from "react";
import "./App.css";
import supabase from "./supabase-client.js";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("TodoList").select("*")
    if (error) {
      console.error("Error fetching todos:", error)
    } else {
      setTodoList(data)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return; // Hindari menambahkan todo kosong
    const newTodoData = {
      name: newTodo,
      isCompleted: false,
    }
    const { data, error } = await supabase.from("TodoList").insert([newTodoData]); // Jangan gunakan `.single()`
    if (error) {
      console.error("Error adding new todo:", error)
    } else {
      if (data) {
        setTodoList([...todoList, data[0]])
      }
      setNewTodo("")
      fetchTodos()
    }
  };

  const updateTask = async (id, isCompleted) => {
    const { error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id)

    if (error) {
      console.error("Error updating todo:", error)
    } else {
      const updatedTodoList = todoList.map((todo) => 
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      )
      setTodoList(updatedTodoList)
    }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase
    .from("TodoList")
    .delete()
    .eq("id", id)

    if (error) {
      console.error("Error deleting todo:", error)
    } else {
      const updatedTodoList = todoList.filter((todo) => todo.id !== id)
      setTodoList(updatedTodoList)
    }
  } 

  return (
    <>
      <div>
        {""}
        <h1>ToDo List</h1>
        <div>
          <input 
            className="border rounded"
            type="text"
            placeholder="New Todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button onClick={addTodo}>Add Todo Item</button>
          <br /> <br />
        </div>
        <ul>
          {todoList.map((todo) => (
            <li key={todo.id}>
              <p>{todo.name}</p>
              <button onClick={() => updateTask(todo.id, todo.isCompleted)}>{todo.isCompleted? "Undo": "Done"}</button>
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

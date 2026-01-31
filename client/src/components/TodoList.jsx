import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TodoList() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    api.get("/todos").then(res => setTodos(res.data));
  }, []);

  const toggle = async (id) => {
    await api.patch(`/todos/${id}`);
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">AI To-Do List</h3>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-3 bg-gray-100 rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggle(todo.id)}
            />
            <span className={todo.completed ? "line-through text-gray-500" : ""}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

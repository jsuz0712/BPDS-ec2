
import { readTodosFile, writeTodosFile } from "@/lib/todos";

type TodoChanges = {
  title?: string;
  completed?: boolean;
};

export async function updateTodo(id: string, changes: TodoChanges) {
  try {
    if (!id) {
      return { success: false, error: "Todo id is required" };
    }

    const todos = await readTodosFile();
    const todoExists = todos.some((todo) => todo.id === id);

    if (!todoExists) {
      return { success: false, error: "Todo not found" };
    }

    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, ...changes } : todo
    );

    await writeTodosFile(updatedTodos);

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { success: false, error: "No se pudo actualizar la tarea" };
  }
}

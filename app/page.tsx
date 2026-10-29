"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { getTodoLists } from "./actions/read";
import { createTodoAction } from "./actions/create";
import { updateTodo } from "./actions/update";
import { deleteTodoAction as removeTodo } from "./actions/delete";
import { restoreTodoAction } from "./actions/restore";
import { Todo } from "@/lib/todos";

type Filter = "all" | "pending" | "completed";

const formatDeletedAt = (deletedAt?: string | null) => {
  if (!deletedAt) return "Eliminada recientemente";

  return `Eliminada el ${new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(deletedAt))}`;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [deletedTodos, setDeletedTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [error, setError] = useState("");

  const refreshTodos = async () => {
    const { active, deleted } = await getTodoLists();
    setTodos(active);
    setDeletedTodos(deleted);
  };

  useEffect(() => {
    const loadTodos = async () => {
      const { active, deleted } = await getTodoLists();
      setTodos(active);
      setDeletedTodos(deleted);
    };

    void loadTodos();
  }, []);

  const createTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTodo.trim();

    if (!title) return;

    const result = await createTodoAction(title);

    if (!result.success) {
      setError(result.error ?? "No se pudo crear la tarea.");
      return;
    }

    setNewTodo("");
    setError("");
    await refreshTodos();
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((todo) => todo.id === id);

    if (!todo) return;

    const result = await updateTodo(id, { completed: !todo.completed });

    if (!result.success) {
      setError(result.error ?? "No se pudo actualizar la tarea.");
      return;
    }

    setError("");
    await refreshTodos();
  };

  const deleteTodo = async (id: string) => {
    const result = await removeTodo(id);

    if (!result.success) {
      setError(result.message ?? "No se pudo eliminar la tarea.");
      return;
    }

    setError("");
    await refreshTodos();
  };

  const restoreTodo = async (id: string) => {
    const result = await restoreTodoAction(id);

    if (!result.success) {
      setError(result.error ?? "No se pudo restaurar la tarea.");
      return;
    }

    setError("");
    await refreshTodos();
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const title = editingTitle.trim();

    if (title) {
      const result = await updateTodo(editingId, { title });

      if (!result.success) {
        setError(result.error ?? "No se pudo actualizar la tarea.");
      } else {
        setError("");
        await refreshTodos();
      }
    }

    setEditingId(null);
    setEditingTitle("");
  };

  const handleEditKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    originalTitle: string
  ) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      setEditingTitle(originalTitle);
      setEditingId(null);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "pending") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const pendingCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - pendingCount;

  return (
    <main className="todo-page">
      <div className="background-shape shape-one" />
      <div className="background-shape shape-two" />

      <section className="todo-app">
        <header className="app-header">
          <div className="header-icon" aria-hidden="true">
            ✓
          </div>

          <div>
            <p className="eyebrow">ORGANIZA TU DÍA</p>
            <h1>Mis tareas - Jesus (EC2 + S3 + GitHub Actions)</h1>
            <p className="subtitle">
              Mantén tus pendientes claros y alcanza tus objetivos.
            </p>
          </div>
        </header>

        <form className="new-todo-form" onSubmit={createTodo}>
          <span className="input-plus" aria-hidden="true">
            +
          </span>

          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Escribe una tarea y presiona Enter"
            aria-label="Nueva tarea"
            autoComplete="off"
          />

          <span className="enter-hint">Enter ↵</span>
        </form>

        {error && <p className="action-error" role="alert">{error}</p>}

        <div className="toolbar">
          <div className="filters" aria-label="Filtrar tareas">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>

            <button
              type="button"
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pendientes
            </button>

            <button
              type="button"
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              Completadas
            </button>
          </div>

          <span className="task-count">
            {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"}
          </span>
        </div>

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ✓
              </div>
              <h2>No hay tareas aquí</h2>
              <p>Agrega una tarea nueva o selecciona otro filtro.</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <article
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <button
                  type="button"
                  className="check-button"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={
                    todo.completed
                      ? `Marcar ${todo.title} como pendiente`
                      : `Marcar ${todo.title} como completada`
                  }
                >
                  {todo.completed && "✓"}
                </button>

                <div className="todo-content">
                  {editingId === todo.id ? (
                    <input
                      className="edit-input"
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(event.target.value)
                      }
                      onBlur={saveEdit}
                      onKeyDown={(event) =>
                        handleEditKeyDown(event, todo.title)
                      }
                      aria-label={`Editar ${todo.title}`}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="todo-title"
                      onClick={() => startEditing(todo)}
                      title="Haz clic para editar"
                    >
                      {todo.title}
                    </button>
                  )}

                  <span className="todo-status">
                    {todo.completed ? "Completada" : "Pendiente"}
                  </span>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Eliminar ${todo.title}`}
                  title="Eliminar tarea"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </article>
            ))
          )}
        </div>

        <section className="trash-section" aria-label="Papelera de tareas">
          <button
            type="button"
            className="trash-toggle"
            onClick={() => setIsTrashOpen((isOpen) => !isOpen)}
            aria-expanded={isTrashOpen}
          >
            <span>Papelera</span>
            <span className="trash-count">
              {deletedTodos.length} {deletedTodos.length === 1 ? "tarea" : "tareas"}
            </span>
          </button>

          {isTrashOpen && (
            <div className="trash-list">
              {deletedTodos.length === 0 ? (
                <div className="trash-empty-state">
                  <h2>La papelera está vacía</h2>
                  <p>Las tareas eliminadas aparecerán aquí.</p>
                </div>
              ) : (
                deletedTodos.map((todo) => (
                  <article key={todo.id} className="trash-item">
                    <div>
                      <span className="trash-title">{todo.title}</span>
                      <span className="deleted-badge">
                        {formatDeletedAt(todo.deletedAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="restore-button"
                      onClick={() => restoreTodo(todo.id)}
                    >
                      Restaurar
                    </button>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        <footer className="app-footer">
          <span>{todos.length} tareas en total</span>
          <span>{completedCount} completadas</span>
        </footer>
      </section>
    </main>
  );
}

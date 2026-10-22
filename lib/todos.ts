import initialTodos from '@/data/todos.json';


// TypeScript interface defining the Todo entity structure
export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    deleted: boolean;
    createdAt: string;
    deletedAt?: string | null; // Optional property for the deletion timestamp
}


// La app se publica como sitio estático (output: 'export') en Apache/EC2,
// así que no hay servidor Node para escribir en data/todos.json.
// Las tareas se guardan en el navegador (localStorage) y data/todos.json
// se usa solo como datos iniciales la primera vez.
const STORAGE_KEY = 'bpds-todos';

/**
 * Reads and parses the stored todos.
 * Returns the initial todos if nothing is stored yet, or [] if it fails.
 */
export async function readTodosFile(): Promise<Todo[]> {
    if (typeof window === 'undefined') {
        return [...(initialTodos as Todo[])];
    }
    try {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data === null) {
            return [...(initialTodos as Todo[])];
        }
        return JSON.parse(data) as Todo[];
    } catch (error) {
        console.error('Error reading todos from storage:', error);
        return [];
    }
}

// Saves the todos array in the browser storage
export async function writeTodosFile(todos: Todo[]): Promise<void> {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        // we throw here so the caller knows the todo was not saved
        console.error('Error writing todos to storage:', error);
        throw error;
    }
}

// Soft deletes a todo by id
export async function deleteTodo(id: string): Promise<void> {
  const todos = await readTodosFile();

  // Validate that the todo exists
  const todoExists = todos.some((todo) => todo.id === id);

  if (!todoExists) {
    throw new Error('Todo not found');
  }

  // Mark the todo as deleted instead of removing it
  const updatedTodos = todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          deleted: true,
          deletedAt: new Date().toISOString(),
        }
      : todo
  );

  await writeTodosFile(updatedTodos);
}

export async function createTodo(title: string): Promise<Todo> {
    if (typeof title !== 'string' || title.trim() === '') {
        throw new Error('Task title is required and cannot be empty');
    }

    const todos = await readTodosFile();

    const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        completed: false,
        deleted: false,
        deletedAt: null,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    await writeTodosFile(todos);

    return newTodo;
}

// the json could be broken, so we check it is really an array
async function readTodosSafe(): Promise<Todo[]> {
    const todos = await readTodosFile();

    if (!Array.isArray(todos)) {
        console.error('todos.json is not an array');
        return [];
    }

    return todos;
}

// tasks still in the main list. old tasks without the flag count as active
export async function getActiveTodos(): Promise<Todo[]> {
    const todos = await readTodosSafe();

    return todos.filter((todo) => todo.deleted !== true);
}

// tasks in the trash
export async function getDeletedTodos(): Promise<Todo[]> {
    const todos = await readTodosSafe();

    return todos.filter((todo) => todo.deleted === true);
}

// Returns a deleted task to the main list.
export async function restoreTodo(id: string): Promise<Todo | null> {
    const todos = await readTodosSafe();
    const todo = todos.find((item) => item.id === id);

    if (!todo) {
        return null;
    }

    todo.deleted = false;
    todo.deletedAt = null;
    await writeTodosFile(todos);

    return todo;
}

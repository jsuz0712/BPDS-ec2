// runs in the browser: the todos are stored in localStorage (static export)

import { readTodosFile, getDeletedTodos as readDeletedTodos, Todo } from '@/lib/todos';

export interface TodoLists {
    active: Todo[];
    deleted: Todo[];
}

// Returns the todos in the trash, newest first
export async function getDeletedTodos(): Promise<Todo[]> {
    const todos = await readDeletedTodos();

    return todos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Returns both lists, so the page can read them in one call
export async function getTodoLists(): Promise<TodoLists> {
    const active = await getTodos();
    const deleted = await getDeletedTodos();

    return { active, deleted };
}

// Returns all the todos, newest first
export async function getTodos(): Promise<Todo[]> {
    // gets the array from todos.json
    const todos = await readTodosFile();

    // the json could be broken, so we check it is really an array
    if (!Array.isArray(todos)) {
        console.error('todos.json is not an array');
        return [];
    }

    // b before a puts the newest ones on top
    return todos
        .filter((todo) => todo.deleted !== true)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

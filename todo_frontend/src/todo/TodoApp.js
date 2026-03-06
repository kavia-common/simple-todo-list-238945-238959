import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "kavia.simpleTodo.todos.v1";

function loadTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: typeof t.id === "string" ? t.id : String(Math.random()),
        title: typeof t.title === "string" ? t.title : "",
        completed: Boolean(t.completed),
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }))
      .filter((t) => t.title.trim().length > 0);
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
export default function TodoApp() {
  /** Main Todo UI with localStorage persistence and filtering. */
  const [todos, setTodos] = useState(() => loadTodos());
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const stats = useMemo(() => {
    const completedCount = todos.filter((t) => t.completed).length;
    const activeCount = todos.length - completedCount;
    return { completedCount, activeCount, total: todos.length };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  function addTodo(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setTodos((prev) => [
      { id: makeId(), title, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setNewTitle("");
    inputRef.current?.focus();
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTodoTitle(id, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      // Empty title => delete for a clean UX
      deleteTodo(id);
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="appShell">
      <header className="header">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <h1 className="title">Todos</h1>
            <p className="subtitle">Stay focused. Keep it simple.</p>
          </div>
        </div>
      </header>

      <main className="card" role="main" aria-label="Todo application">
        <form className="newTodoForm" onSubmit={addTodo} aria-label="Add a new todo">
          <label className="srOnly" htmlFor="newTodo">
            New todo
          </label>
          <input
            id="newTodo"
            ref={inputRef}
            className="textInput"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
          />
          <button type="submit" className="primaryButton">
            Add
          </button>
        </form>

        <div className="toolbar" role="toolbar" aria-label="Todo filters and actions">
          <div className="filterGroup" aria-label="Filters">
            <button
              type="button"
              className={filter === "all" ? "chip chipActive" : "chip"}
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={filter === "active" ? "chip chipActive" : "chip"}
              onClick={() => setFilter("active")}
            >
              Active ({stats.activeCount})
            </button>
            <button
              type="button"
              className={filter === "completed" ? "chip chipActive" : "chip"}
              onClick={() => setFilter("completed")}
            >
              Completed ({stats.completedCount})
            </button>
          </div>

          <button
            type="button"
            className="dangerButton"
            onClick={clearCompleted}
            disabled={stats.completedCount === 0}
          >
            Clear completed
          </button>
        </div>

        <ul className="todoList" aria-label="Todo list">
          {filteredTodos.length === 0 ? (
            <li className="emptyState" aria-label="No todos">
              {filter === "completed"
                ? "No completed todos yet."
                : filter === "active"
                  ? "No active todos — nice work."
                  : "Add your first todo to get started."}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => deleteTodo(todo.id)}
                onSave={(title) => updateTodoTitle(todo.id, title)}
              />
            ))
          )}
        </ul>
      </main>

      <footer className="footer">
        <span className="muted">
          Stored locally · {stats.activeCount} active {stats.activeCount === 1 ? "item" : "items"}
        </span>
      </footer>
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const editRef = useRef(null);

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  function startEdit() {
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(todo.title);
    setIsEditing(false);
  }

  function commitEdit() {
    onSave(draft);
    setIsEditing(false);
  }

  return (
    <li className={todo.completed ? "todoRow todoCompleted" : "todoRow"}>
      <label className="checkWrap">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        />
        <span className="checkText">Done</span>
      </label>

      {isEditing ? (
        <input
          ref={editRef}
          className="editInput"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          onBlur={commitEdit}
          aria-label="Edit todo title"
        />
      ) : (
        <button type="button" className="todoTitle" onClick={startEdit} aria-label="Edit todo">
          {todo.title}
        </button>
      )}

      <div className="rowActions" aria-label="Todo actions">
        <button
          type="button"
          className="secondaryButton"
          onClick={() => (isEditing ? commitEdit() : startEdit())}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
        <button type="button" className="dangerButton" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

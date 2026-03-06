import React from "react";
import { useHistory } from "react-router-dom";

// PUBLIC_INTERFACE
export default function WelcomePage() {
  /** Welcome landing page shown before the todo UI. */
  const history = useHistory();

  return (
    <div className="appShell">
      <header className="header">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <h1 className="title">Welcome</h1>
            <p className="subtitle">A simple, modern Todo app</p>
          </div>
        </div>
      </header>

      <main className="card" role="main" aria-label="Welcome">
        <h2 className="cardTitle">Get started</h2>
        <p className="cardText">
          Track tasks, edit them anytime, filter by status, and keep everything saved automatically in your browser.
        </p>

        <ul className="featureList" aria-label="Features">
          <li>Add, edit, and delete todos</li>
          <li>Mark complete or active</li>
          <li>Filter: all / active / completed</li>
          <li>Persists via localStorage</li>
        </ul>

        <div className="actions">
          <button
            type="button"
            className="primaryButton"
            onClick={() => history.push("/todos")}
          >
            Continue to Todos
          </button>
          <a className="linkButton" href="/todos" onClick={(e) => { e.preventDefault(); history.push("/todos"); }}>
            Skip welcome
          </a>
        </div>
      </main>

      <footer className="footer">
        <span className="muted">Tip: Your todos are stored locally on this device.</span>
      </footer>
    </div>
  );
}

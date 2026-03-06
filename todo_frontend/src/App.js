import React from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import TodoPage from "./pages/TodoPage";

/**
 * App root with routing.
 * - "/" is the welcome landing page
 * - "/todos" is the todo application UI
 */
export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={WelcomePage} />
        <Route exact path="/todos" component={TodoPage} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

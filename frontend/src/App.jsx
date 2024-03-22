import React from "react";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Dashboard />
    </Router>
  );
}

export default App;
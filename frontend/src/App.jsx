import React from "react";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import "./styles/theme.css";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle />
        <Dashboard />
      </Router>
    </ThemeProvider>
  );
}

export default App;
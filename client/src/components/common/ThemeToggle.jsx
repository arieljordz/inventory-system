import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={toggleDarkMode}
      title="Toggle theme"
    >
      <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
    </button>
  );
};

export default ThemeToggle;

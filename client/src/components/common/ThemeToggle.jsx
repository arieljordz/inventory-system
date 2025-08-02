import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <a
      href="#"
      className="nav-link btn btn-link"
      onClick={(e) => {
        e.preventDefault();
        toggleDarkMode();
      }}
      role="button"
      title="Toggle theme"
    >
      <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
    </a>
  );
};

export default ThemeToggle;

// context/SpinnerContext.js
import React, { createContext, useContext, useState } from "react";

const SpinnerContext = createContext();

export const useSpinner = () => useContext(SpinnerContext);

export const SpinnerProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showSpinner = () => setLoading(true);
  const hideSpinner = () => setLoading(false);

  return (
    <SpinnerContext.Provider value={{ loading, showSpinner, hideSpinner }}>
      {children}
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner-border text-light" role="status"></div>
        </div>
      )}
    </SpinnerContext.Provider>
  );
};

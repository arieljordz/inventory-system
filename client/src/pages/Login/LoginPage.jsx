import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const { showSpinner, hideSpinner } = useSpinner();

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      setMessage("Google login failed: No credential provided");
      return;
    }

    setMessage(""); // Clear previous message
    showSpinner();

    try {
      const response = await googleLogin(credential);

      if (!response.success) {
        setMessage(response.message || "Login failed");
        hideSpinner();
      } else {
        navigate(response.redirectPath);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong during login.");
      hideSpinner();
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
      <div
        className="card shadow-sm border-0 w-100"
        style={{ maxWidth: "420px" }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src="/images/is-icon.png"
              alt="Inventory System Logo"
              className="img-fluid mb-3"
              style={{ maxWidth: "70px" }}
            />
            <h3 className="fw-bold">Inventory System</h3>
            <p className="text-muted mb-0">Sign in with your Google account</p>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("Google login failed")}
              width="100%"
              theme="outline"
              size="large"
            />
          </div>

          {message && (
            <Alert variant="danger" className="text-center mt-3">
              {message}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

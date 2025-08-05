import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Alert } from "react-bootstrap";
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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow-lg border-0"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src="/images/is-icon.png"
              alt="Logo"
              className="img-fluid mb-2"
              style={{ maxWidth: "80px" }}
            />
            <h4 className="fw-bold mb-0">Inventory System</h4>
            <p className="text-muted mt-3 mb-3">
              Sign in with your Google account
            </p>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("Google login failed")}
            />
          </div>

          {message && (
            <Alert variant="danger" className="text-center mt-3 mb-0">
              {message}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

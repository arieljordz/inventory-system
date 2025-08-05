import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      setMessage("Google login failed: No credential provided");
      return;
    }

    setLoading(true);
    try {
      const response = await googleLogin(credential);
      if (!response.success) {
        setMessage(response.message || "Login failed");
      } else {
        window.location.href = response.redirectPath;
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            {/* ✅ Logo */}
            <img
              src="/images/is-icon.png"
              alt="Logo"
              className="img-fluid mb-2"
              style={{ maxWidth: "80px" }}
            />
            {/* ✅ System Name */}
            <h4 className="fw-bold mb-0">Inventory System</h4>
            <p className="text-muted mt-3 mb-3">Sign in with your Google account</p>
          </div>

          <div className="d-flex justify-content-center mb-3">
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("Google login failed")}
              />
            )}
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

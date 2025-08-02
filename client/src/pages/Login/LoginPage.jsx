import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PasswordEnum } from "../../enums/enums";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      setMessage("Google login failed: No credential provided");
      return;
    }

    setLoading(true);
    try {
      const decoded = jwtDecode(credential);
      const userPayload = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        password: PasswordEnum.DEFAULT_PASS,
      };

      const result = await googleLogin(userPayload);
      if (!result.success) {
        setMessage(result.message || "Google login failed");
      } else {
        navigate(result.redirectPath);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setMessage("Google login failed: Invalid credential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hold-transition login-page bg-light">
      <div className="login-box">
        <div className="card card-outline card-primary shadow">
          <div className="card-body">
            <h3 className="text-center mb-4">Sign in with Google</h3>

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
              <Alert variant="danger" className="text-center">
                {message}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

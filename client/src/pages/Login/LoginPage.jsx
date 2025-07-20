import React from "react";
import LoginForm from "../../components/login/LoginForm";

const LoginPage = () => {
  return (
    <div className="hold-transition login-page bg-light">
      <div className="login-box">
        <div className="card card-outline card-primary shadow">
          {/* <div className="card-header text-center">
            <a href="/" className="h1"><b>Inventory</b>System</a>
          </div> */}
          <div className="card-body">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

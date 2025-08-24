import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const LogoutButton = () => {
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from the system.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
    });

    if (result.isConfirmed) {
      await logout();
      navigate("/");
    }
  };

  return (
    <div className="d-flex align-items-center">
      {user?.email && (
        <span className="small mb-1 dark-mode-text-white">{user.email}</span>
      )}
      <a
        href="#"
        className="nav-link btn btn-link"
        onClick={handleLogout}
        role="button"
        title="Logout"
      >
        <i className="fas fa-sign-out-alt"></i>
      </a>
    </div>
  );
};

export default LogoutButton;

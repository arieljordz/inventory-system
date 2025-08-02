import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const LogoutButton = () => {
  const { logout } = useAuth();
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
    <a
      href="#"
      className="nav-link btn btn-link"
      onClick={handleLogout}
      role="button"
      title="Logout"
    >
      <i className="fas fa-sign-out-alt"></i>
    </a>
  );
};

export default LogoutButton;

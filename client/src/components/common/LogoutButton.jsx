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
    <div className="d-flex flex-column align-items-start">
      {user?.name && <span className="small text-white">{user.name}</span>}
      {user?.email && (
        <span className="small mb-2 text-white">{user.email}</span>
      )}
      <button
        type="button"
        className="btn btn-outline-primary btn-sm btn-block d-flex align-items-center justify-content-start gap-2"
        onClick={handleLogout}
      >
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default LogoutButton;

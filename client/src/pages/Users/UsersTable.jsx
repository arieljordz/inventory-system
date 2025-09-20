// src/pages/Users/UsersTable.jsx
import React from "react";
import VerifiedBadge from "../../components/VerifiedBadge";

const UsersTable = ({ users = [], onEdit, onDelete, loading = false }) => {
  const handleEdit = (user) => {
    if (!loading) onEdit?.(user);
  };

  const handleDelete = (id) => {
    if (!loading) onDelete?.(id);
  };

  const renderActionButtons = (user) => (
    <div className="btn-group" role="group">
      <button
        className="btn btn-sm btn-warning"
        title="Edit User"
        onClick={() => handleEdit(user)}
        disabled={loading}
      >
        <i className="fas fa-edit"></i>
      </button>
      <button
        className="btn btn-sm btn-danger"
        title="Delete User"
        onClick={() => handleDelete(user._id)}
        disabled={loading}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading users...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!users || users.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-users fa-2x mb-2 d-block"></i>
              No users found
            </div>
          </td>
        </tr>
      );
    }

    return users.map((user, index) => (
      <tr key={user._id}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="rounded-circle mr-2"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="d-flex align-items-center">
              <span className="font-weight-medium">{user.name}</span>
            </div>
          </div>
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            <span>{user.email}</span>
          </div>
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            <span>{user.role}</span>
          </div>
        </td>
        <td className="text-center align-middle">
          <VerifiedBadge status={user.isVerified} />
        </td>
        <td className="text-center align-middle">
          {renderActionButtons(user)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-users mr-2"></i>
          Users
        </h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="thead-light">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>
                  #
                </th>
                <th style={{ width: "250px" }}>Name</th>
                <th style={{ width: "250px" }}>Email</th>
                <th style={{ width: "120px" }}>Role</th>
                <th className="text-center" style={{ width: "120px" }}>
                  Status
                </th>
                <th className="text-center" style={{ width: "150px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;

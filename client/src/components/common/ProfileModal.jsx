import React from "react";
import { Modal, Button } from "react-bootstrap";
import { formatDateString } from "../../utils/commonUtils";

const ProfileModal = ({ user, show, onClose }) => {
  if (!user) return null;

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="md" centered>
      {/* Header */}
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="fas fa-user-circle mr-2"></i> User Profile
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body>
        <div className="text-center mb-3">
          {/* Avatar */}
          <img
            className="profile-user-img img-fluid img-circle"
            src={user.picture || "/images/default-avatar.png"}
            alt="User profile"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>

        {/* Name & Email */}
        <h4 className="text-center">{user.name}</h4>
        <p className="text-muted text-center mb-2">{user.email}</p>

        {/* Verification Badge */}
        <div className="text-center mb-3">
          {user.isVerified ? (
            <span className="badge badge-success">
              <i className="fas fa-check-circle mr-1"></i> Verified
            </span>
          ) : (
            <span className="badge badge-danger">
              <i className="fas fa-exclamation-circle mr-1"></i> Not Verified
            </span>
          )}
        </div>

        {/* Info list */}
        <div className="mb-3">
          <div className="d-flex justify-content-between py-2 border-bottom">
            <strong>Joined</strong>
            <span>{formatDateString(user?.createdAt)}</span>
          </div>
          <div className="d-flex justify-content-between py-2 border-bottom">
            <strong>Last Updated</strong>
            <span>{formatDateString(user?.updatedAt)}</span>
          </div>
        </div>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          <i className="fas fa-times mr-1"></i> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileModal;

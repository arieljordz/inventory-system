import React from "react";

const VerifiedBadge = ({ status }) => {
  const verifiedStatus = status === true ? "Verified" : "Unverified";

  const statusConfig = {
    Verified: { label: "Verified", color: "success" },
    Unverified: { label: "Unverified", color: "danger" },
  };

  const { label, color } = statusConfig[verifiedStatus];

  return <span className={`badge badge-pill badge-${color}`}>{label}</span>;
};

export default VerifiedBadge;

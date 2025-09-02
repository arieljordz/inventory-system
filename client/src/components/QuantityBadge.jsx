// components/common/QuantityBadge.js
import React from "react";

const QuantityBadge = ({ quantity = 0, unit = "pcs" }) => {
  const getBadgeClass = () => {
    if (quantity === 0) return "badge badge-danger";
    if (quantity < 10) return "badge badge-warning";
    return "badge badge-success";
  };

  return (
    <span className={getBadgeClass()}>
      {quantity} {unit}
    </span>
  );
};

export default QuantityBadge;

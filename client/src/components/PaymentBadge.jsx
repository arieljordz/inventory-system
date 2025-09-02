import React from "react";
import { PaymentStatusEnum } from "../enums/enums";

const PaymentBadge = ({ status }) => {
  // convert boolean to enum value
  const paymentStatus = status ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID;

  const statusConfig = {
    [PaymentStatusEnum.PAID]: { label: "Paid", color: "success" },
    [PaymentStatusEnum.UNPAID]: { label: "Unpaid", color: "danger" },
  };

  const { label, color } = statusConfig[paymentStatus];

  return <span className={`badge badge-pill badge-${color}`}>{label}</span>;
};

export default PaymentBadge;

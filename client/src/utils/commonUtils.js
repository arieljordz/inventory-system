export const formatAmount = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

export const formatDateTime = (dateTime) => {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const getStatusBadgeData = (
  status,
  customColorMap = {},
  customLabelMap = {}
) => {
  // Normalize status to string
  const statusKey = typeof status === "boolean" ? String(status) : status;

  const defaultColorMap = {
    Available: "success",
    "For Pick Up": "warning",
    "Out of Stock": "danger",
    true: "success",
    false: "secondary",
  };

  const defaultLabelMap = {
    true: "Paid",
    false: "Unpaid",
  };

  const colorMap = { ...defaultColorMap, ...customColorMap };
  const labelMap = { ...defaultLabelMap, ...customLabelMap };

  return {
    label: labelMap[statusKey] ?? statusKey,
    color: colorMap[statusKey] ?? "secondary",
  };
};

export const computeTotalPrice = (quantity, price) => {
  const qty = Number(quantity);
  const unitPrice = Number(price);

  if (isNaN(qty) || isNaN(unitPrice) || qty < 0 || unitPrice < 0) {
    return 0;
  }

  return qty * unitPrice;
};
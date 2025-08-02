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

// ✅ Refactor getStatusBadge to return metadata (not JSX)
export const getStatusBadgeData = (status, customColorMap = {}) => {
  const defaultColorMap = {
    Available: "success",
    "For Pick Up": "warning",
    "Out of Stock": "danger",
  };

  const colorMap = { ...defaultColorMap, ...customColorMap };
  const color = colorMap[status] || "secondary";

  return {
    label: status,
    color,
  };
};

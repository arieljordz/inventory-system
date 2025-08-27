import { ReportTypeEnum } from "../enums/enums";
import { formatAmount } from "../utils/commonUtils";

export const formatReportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];

  return reportData.map((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (reportType.includes(ReportTypeEnum.INVENTORY)) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: date,
        Status: item.status || "-",
      };
    } else if (
      reportType === ReportTypeEnum.ORDERS ||
      reportType.startsWith("ORDERS_")
    ) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Date: date,
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    } else {
      const price = item.product?.price || 0;
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: formatAmount(price),
        "Total Amount": formatAmount(item.totalAmount),
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const formatExportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];

  return reportData.map((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (reportType.includes(ReportTypeEnum.INVENTORY)) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: date,
        Status: item.status || "-",
      };
    } else if (
      reportType === ReportTypeEnum.ORDERS ||
      reportType.startsWith("ORDERS_")
    ) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Date: date,
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    } else {
      const price = item.product?.price || 0;
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: price,
        "Total Amount": item.totalAmount,
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const getCenteredColumns = (reportType = "") => {
  if (reportType.includes(ReportTypeEnum.INVENTORY)) {
    return ["Variant", "Quantity", "Type", "Date", "Status"];
  } else if (
    reportType === ReportTypeEnum.ORDERS ||
    reportType.startsWith("ORDERS_")
  ) {
    return [
      "Variant",
      "Platform Order ID",
      "Quantity",
      "Platform",
      "Courier",
      "Date",
      "Payment Status",
    ];
  } else {
    return [
      "Variant",
      "Platform Order ID",
      "Quantity",
      "Platform",
      "Courier",
      "Date",
      "Payment Status",
    ];
  }
};

export const getReportFileName = (
  reportType,
  startDate,
  endDate,
  extension
) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}${dd}${yyyy}`;
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `REPORT-${reportType}-${start}-${end}.${extension}`;
};

export const getReportTitleText = (reportType, startDate, endDate) => {
  return `REPORT: ${reportType.toUpperCase()} ${startDate} - ${endDate}`;
};

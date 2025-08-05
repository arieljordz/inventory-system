import { ReportTypeEnum } from "../enums/enums";

export const formatReportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];

  return reportData.map((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (reportType.includes(ReportTypeEnum.INVENTORY)) {
      // Inventory Report
      return {
        Product: item.product?.name || "-",
        Quantity: item.quantity,
        "Type": item.movementType || "-",
        Date: date,
        Status: item.status || "-",
      };
    } else {
      // Sales Report
      return {
        Product: item.product?.name || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Quantity: item.quantity,
        Platform: item.platform || "-",
        Courier: item.courier || "-",
        Date: date,
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const getCenteredColumns = (reportType = "") => {
  //   console.log("reportType:", reportType);
  if (reportType.includes(ReportTypeEnum.INVENTORY)) {
    return ["Quantity", "Type", "Date", "Status"];
  } else {
    return [
      "Platform Order ID",
      "Quantity",
      "Platform",
      "Courier",
      "Date",
      "Payment Status",
    ];
  }
};

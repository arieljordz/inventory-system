// import moment from "moment-timezone";
// import InventoryDetail from "../models/InventoryDetail.js";
// import Order from "../models/Order.js";
// import {
//   ReportTypeEnum,
//   MovementTypeEnum,
//   StatusEnum,
// } from "../enums/enums.js";

// export const getReportData = async (req, res) => {
//   try {
//     const {
//       reportType = ReportTypeEnum.INVENTORY,
//       startDate,
//       endDate,
//     } = req.query;

//     const dateFilter = {};
//     if (startDate || endDate) {
//       dateFilter.createdAt = {};
//       if (startDate) {
//         dateFilter.createdAt.$gte = moment
//           .tz(startDate, "Asia/Manila")
//           .startOf("day")
//           .toDate();
//       }
//       if (endDate) {
//         dateFilter.createdAt.$lte = moment
//           .tz(endDate, "Asia/Manila")
//           .endOf("day")
//           .toDate();
//       }
//     }

//     let filter = { ...dateFilter };
//     let data = [];
//     let isSalesReport = false;

//     if (
//       reportType === ReportTypeEnum.SALES ||
//       reportType === ReportTypeEnum.SALES_PAID ||
//       reportType === ReportTypeEnum.SALES_UNPAID
//     ) {
//       isSalesReport = true;

//       switch (reportType) {
//         case ReportTypeEnum.SALES_PAID:
//           filter.isPaid = true;
//           break;
//         case ReportTypeEnum.SALES_UNPAID:
//           filter.isPaid = false;
//           break;
//         default:
//           break;
//       }

//       data = await Order.find(filter)
//         .populate("product", "name serialNumber price variant")
//         .sort({ createdAt: -1 });
//     } else {
//       switch (reportType) {
//         case ReportTypeEnum.INVENTORY_IN:
//           filter.movementType = MovementTypeEnum.IN;
//           break;
//         case ReportTypeEnum.INVENTORY_OUT:
//           filter.movementType = MovementTypeEnum.OUT;
//           break;
//         default:
//           break;
//       }

//       data = await InventoryDetail.find(filter)
//         .populate("product", "name serialNumber price variant")
//         .sort({ createdAt: -1 });
//     }

//     // Compute totalAmount per item
//     const tempFormattedData = data.map((item) => {
//       const price = item.product?.price || 0;
//       const quantity = item.quantity || 0;
//       const totalAmount = isSalesReport ? price * quantity : 0;

//       return {
//         ...item.toObject(),
//         totalAmount,
//       };
//     });

//     // Calculate the grand total for sales report
//     const grandTotalAmount = isSalesReport
//       ? tempFormattedData.reduce((sum, item) => sum + item.totalAmount, 0)
//       : 0;

//     // Attach grandTotalAmount to each item
//     const formattedData = tempFormattedData.map((item) => ({
//       ...item,
//       grandTotalAmount,
//     }));

//     res.json({ data: formattedData });
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ error: "Failed to generate report" });
//   }
// };

import moment from "moment-timezone";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import { ReportTypeEnum, MovementTypeEnum } from "../enums/enums.js";
import {
  formatExportData,
  getReportFileName,
  getReportTitleText,
} from "../utils/reportUtils.js";

/**
 * Get report data for frontend display
 */
export const getReportData = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.INVENTORY,
      startDate,
      endDate,
    } = req.query;

    const filter = buildDateFilter(startDate, endDate);

    const { data, isSalesReport } = await fetchReportData(reportType, filter);

    const formattedData = data.map((item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      const totalAmount = isSalesReport ? price * quantity : 0;
      return { ...item.toObject(), totalAmount };
    });

    const grandTotalAmount = isSalesReport
      ? formattedData.reduce((sum, item) => sum + item.totalAmount, 0)
      : 0;

    const finalData = formattedData.map((item) => ({
      ...item,
      grandTotalAmount,
    }));

    res.json({ data: finalData });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

/**
 * Export report to Excel or PDF
 */
export const exportReport = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.INVENTORY,
      startDate,
      endDate,
      format,
    } = req.body;

    const filter = buildDateFilter(startDate, endDate);

    const { data, isSalesReport } = await fetchReportData(reportType, filter);

    if (!data.length)
      return res.status(400).json({ message: "No data to export" });

    const exportData = formatExportData(data, reportType);
    const filename = getReportFileName(reportType, startDate, endDate, format);

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Report");

      // Add header row
      sheet.addRow(Object.keys(exportData[0]));

      // Add data rows
      exportData.forEach((row) => sheet.addRow(Object.values(row)));

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === "pdf") {
      const doc = new jsPDF();
      const headers = Object.keys(exportData[0]);
      const body = exportData.map((row) => Object.values(row));

      // Optional: Compute grand total for sales
      if (isSalesReport) {
        const totalAmount = exportData.reduce(
          (acc, row) => acc + (row["Total Amount"] || 0),
          0
        );
        const totalRow = headers.map((h) =>
          h === "Total Amount" ? totalAmount : ""
        );
        body.push(totalRow);
      }

      doc.text(getReportTitleText(reportType, startDate, endDate), 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [headers],
        body,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      const pdfBuffer = doc.output("arraybuffer");
      res.send(Buffer.from(pdfBuffer));
    } else {
      return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ message: "Failed to export report" });
  }
};

/** Helper: build date filter for Mongoose */
const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};

  const dateFilter = { createdAt: {} };
  if (startDate) {
    dateFilter.createdAt.$gte = moment
      .tz(startDate, "Asia/Manila")
      .startOf("day")
      .toDate();
  }
  if (endDate) {
    dateFilter.createdAt.$lte = moment
      .tz(endDate, "Asia/Manila")
      .endOf("day")
      .toDate();
  }
  return dateFilter;
};

/** Helper: fetch data based on report type */
const fetchReportData = async (reportType, filter) => {
  let data = [];
  let isSalesReport = false;

  if (
    reportType === ReportTypeEnum.SALES ||
    reportType === ReportTypeEnum.SALES_PAID ||
    reportType === ReportTypeEnum.SALES_UNPAID
  ) {
    isSalesReport = true;
    if (reportType === ReportTypeEnum.SALES_PAID) filter.isPaid = true;
    if (reportType === ReportTypeEnum.SALES_UNPAID) filter.isPaid = false;

    data = await Order.find(filter)
      .populate("product", "name serialNumber price variant")
      .sort({ createdAt: -1 });
  } else {
    if (reportType === ReportTypeEnum.INVENTORY_IN)
      filter.movementType = MovementTypeEnum.IN;
    if (reportType === ReportTypeEnum.INVENTORY_OUT)
      filter.movementType = MovementTypeEnum.OUT;

    data = await InventoryDetail.find(filter)
      .populate("product", "name serialNumber price variant")
      .sort({ createdAt: -1 });
  }

  return { data, isSalesReport };
};

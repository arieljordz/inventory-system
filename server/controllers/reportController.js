import moment from "moment-timezone";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import { ReportTypeEnum, MovementTypeEnum } from "../enums/enums.js";
import {
  formatExportData,
  getReportFileName,
  getReportTitleText,
  buildDateFilter,
  fetchReportData,
  wrapTextByWidth,
  sanitizeText,
} from "../utils/reportUtils.js";

/** Get report data for frontend display */
export const getReportData = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.INVENTORY,
      startDate,
      endDate,
    } = req.query;

    const filter = buildDateFilter(startDate, endDate);
    const { data, isSalesReport } = await fetchReportData(reportType, filter);

    let grandTotalAmount = 0;

    const formattedData = data.map((item) => {
      const obj = typeof item.toObject === "function" ? item.toObject() : item;
      const price = obj.product?.price || 0;
      const quantity = obj.quantity || 0;
      const totalAmount = isSalesReport ? price * quantity : 0;

      if (isSalesReport) {
        grandTotalAmount += totalAmount;
      }

      return { ...obj, totalAmount };
    });

    res.json({ data: formattedData, grandTotalAmount });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

/** Export report to Excel or PDF with Legal landscape and adjusted column widths */
export const exportReport = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.INVENTORY,
      startDate,
      endDate,
      format,
    } = req.body;

    const filter = {};
    if (startDate)
      filter.createdAt = { $gte: moment(startDate).startOf("day").toDate() };
    if (endDate)
      filter.createdAt = {
        ...filter.createdAt,
        $lte: moment(endDate).endOf("day").toDate(),
      };

    let data = [];
    let isSalesReport = false;

    // 🔹 Determine report type
    if (
      [
        ReportTypeEnum.SALES,
        ReportTypeEnum.SALES_PAID,
        ReportTypeEnum.SALES_UNPAID,
      ].includes(reportType)
    ) {
      isSalesReport = true;

      if (reportType === ReportTypeEnum.SALES_PAID) filter.isPaid = true;
      if (reportType === ReportTypeEnum.SALES_UNPAID) filter.isPaid = false;

      data = await Order.find(filter)
        .populate("product", "name price variant")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      if (reportType === ReportTypeEnum.INVENTORY_IN)
        filter.movementType = MovementTypeEnum.IN;
      if (reportType === ReportTypeEnum.INVENTORY_OUT)
        filter.movementType = MovementTypeEnum.OUT;

      data = await InventoryDetail.find(filter)
        .populate("product", "name price variant")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!data.length) {
      return res.status(400).json({ message: "No data to export" });
    }

    // 🔹 Always map with totalAmount logic
    data = data.map((item) => ({
      ...item,
      totalAmount: isSalesReport
        ? item.product?.price && item.quantity
          ? item.product.price * item.quantity
          : 0
        : 0, // Inventory reports always return 0
    }));

    // console.log("data to export:", data[0]);

    const exportData = formatExportData(data, reportType);
    const filename = getReportFileName(reportType, startDate, endDate, format);

    if (format === "xlsx") {
      await exportXLSX(res, filename, exportData, isSalesReport);
    } else if (format === "pdf") {
      await exportPDF(
        res,
        filename,
        exportData,
        isSalesReport,
        reportType,
        startDate,
        endDate
      );
    } else {
      return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ message: "Failed to export report" });
  }
};

const exportXLSX = async (res, filename, exportData, isSalesReport = false) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  // Add header row
  const headers = Object.keys(exportData[0]);
  sheet.addRow(headers);

  // Add data rows
  exportData.forEach((row) => sheet.addRow(Object.values(row)));

  // If it's a sales report, compute and add Grand Total
  if (isSalesReport) {
    // Find index of "Total Amount" column
    const totalAmountIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("total amount")
    );

    if (totalAmountIndex >= 0) {
      const grandTotal = exportData.reduce((sum, row) => {
        const raw = row["Total Amount"] || "0";
        const numeric = parseFloat(raw.toString().replace(/[^\d.-]/g, ""));
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0);

      // console.log("grandTotal:", grandTotal);
      // Add an empty row as spacer
      sheet.addRow([]);

      // Add Grand Total row
      const totalRowValues = Array(headers.length).fill("");
      totalRowValues[
        totalAmountIndex
      ] = `Grand Total: ${grandTotal.toLocaleString()}`;
      const totalRow = sheet.addRow(totalRowValues);

      // Bold the Grand Total row
      totalRow.font = { bold: true };
    }
  }

  // Send response
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
};

const exportPDF = async (
  res,
  filename,
  exportData,
  isSalesReport = false,
  reportType,
  startDate,
  endDate
) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Legal Landscape: 14in x 8.5in in points
  const legalWidth = 1008;
  const legalHeight = 612;
  const margin = 40;
  const fontSize = 9;
  let page = pdfDoc.addPage([legalWidth, legalHeight]);
  let yPos = legalHeight - margin;

  const headers = Object.keys(exportData[0]);

  // Calculate column widths
  const calculateColumnWidths = () => {
    const widths = headers.map((header, i) => {
      // For Product Name column, reserve more space
      if (header.toLowerCase().includes("product")) return legalWidth * 0.4;

      let maxWidth = font.widthOfTextAtSize(header, fontSize);
      for (const row of exportData) {
        const cellLines = wrapTextByWidth(
          sanitizeText(row[header]?.toString()),
          font,
          fontSize,
          legalWidth * 0.3
        );
        cellLines.forEach((line) => {
          maxWidth = Math.max(maxWidth, font.widthOfTextAtSize(line, fontSize));
        });
      }
      return maxWidth + 10; // padding
    });

    // Adjust remaining width for product name column
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const remaining = legalWidth - 2 * margin - totalWidth;
    const productIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("product")
    );
    if (productIndex >= 0) widths[productIndex] += remaining;
    return widths;
  };
  const columnWidths = calculateColumnWidths();

  // Title
  const titleLines = wrapTextByWidth(
    sanitizeText(getReportTitleText(reportType, startDate, endDate)),
    font,
    fontSize,
    legalWidth - 2 * margin
  );
  titleLines.forEach((line) => {
    page.drawText(line, {
      x: margin,
      y: yPos,
      size: fontSize + 2,
      font,
      color: rgb(0, 0, 0),
    });
    yPos -= fontSize + 6;
  });
  yPos -= 10;

  // Draw header with background
  const drawHeader = () => {
    let xPos = margin;
    headers.forEach((header, i) => {
      const width = columnWidths[i];
      page.drawRectangle({
        x: xPos,
        y: yPos - 4,
        width,
        height: fontSize + 6,
        color: rgb(0.8, 0.8, 0.8),
      });
      page.drawText(sanitizeText(header), {
        x: xPos + 2,
        y: yPos,
        size: fontSize,
        font,
      });
      xPos += width;
    });
    yPos -= fontSize + 10;
  };
  drawHeader();

  // Table body
  for (const row of exportData) {
    const cellLinesList = Object.values(row).map((val, i) =>
      wrapTextByWidth(
        sanitizeText(val?.toString()),
        font,
        fontSize,
        columnWidths[i] - 4
      )
    );
    const rowHeight =
      Math.max(...cellLinesList.map((lines) => lines.length * (fontSize + 2))) +
      4;

    let xPos = margin;
    cellLinesList.forEach((cellLines, i) => {
      const width = columnWidths[i];
      cellLines.forEach((line, idx) => {
        page.drawText(line, {
          x: xPos + 2,
          y: yPos - idx * (fontSize + 2),
          size: fontSize,
          font,
        });
      });
      xPos += width;
    });

    yPos -= rowHeight;

    if (yPos < margin + 40) {
      page = pdfDoc.addPage([legalWidth, legalHeight]);
      yPos = legalHeight - margin;
      drawHeader();
    }
  }

  // Grand total at end
  if (isSalesReport) {
    // console.log("exportData:", exportData[0]);
    const totalAmount = exportData.reduce((acc, row) => {
      const raw = row["Total Amount"] || "0";
      const numeric = parseFloat(raw.toString().replace(/[^\d.-]/g, "")); // strip ₱ and commas
      return acc + (isNaN(numeric) ? 0 : numeric);
    }, 0);

    // console.log("totalAmount:", totalAmount);

    if (yPos < margin + 20) {
      page = pdfDoc.addPage([legalWidth, legalHeight]);
      yPos = legalHeight - margin;
      drawHeader();
    }

    page.drawText(`Grand Total: PHP ${totalAmount.toLocaleString()}`, {
      x: margin,
      y: yPos - 10,
      size: fontSize + 1,
      font,
    });
  }

  const pdfBytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(Buffer.from(pdfBytes));
};

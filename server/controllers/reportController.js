import moment from "moment-timezone";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import ItemMovement from "../models/ItemMovement.js";
import Item from "../models/Item.js";
import {
  ReportTypeEnum,
  MovementTypeEnum,
  NewReportTypeEnum,
} from "../enums/enums.js";
import {
  formatExportData,
  getReportFileName,
  getReportTitleText,
  buildDateFilter,
  fetchReportData,
  wrapTextByWidth,
  sanitizeText,
  reportColumnsConfig,
  flattenReportData,
} from "../utils/reportUtils.js";
import Product from "../models/Product.js";
import { StatusEnum } from "../enums/enums.js";
import mongoose from "mongoose";

/** Get report data for frontend display */
export const getReportData = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.ORDERS,
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
      reportType = ReportTypeEnum.ORDERS,
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

    // --- ITEMS REPORTS ---
    if (
      reportType === ReportTypeEnum.ITEMS ||
      reportType === ReportTypeEnum.ITEMS_IN ||
      reportType === ReportTypeEnum.ITEMS_OUT
    ) {
      if (reportType === ReportTypeEnum.ITEMS_IN)
        filter.type = MovementTypeEnum.IN;
      if (reportType === ReportTypeEnum.ITEMS_OUT)
        filter.type = MovementTypeEnum.OUT;

      data = await ItemMovement.find(filter)
        .populate("item", "name price variant status location createdAt")
        .sort({ createdAt: -1 })
        .lean();
    }

    // --- ORDERS REPORTS ---
    if (
      reportType === ReportTypeEnum.ORDERS ||
      reportType === ReportTypeEnum.PRODUCTS_IN ||
      reportType === ReportTypeEnum.PRODUCTS_OUT
    ) {
      if (reportType === ReportTypeEnum.ITEMS_IN)
        filter.type = MovementTypeEnum.IN;
      if (reportType === ReportTypeEnum.ITEMS_OUT)
        filter.type = MovementTypeEnum.OUT;

      data = await InventoryDetail.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 })
        .lean();
    }

    // --- SALES REPORTS ---
    if (
      reportType === ReportTypeEnum.SALES ||
      reportType === ReportTypeEnum.SALES_PAID ||
      reportType === ReportTypeEnum.SALES_UNPAID ||
      reportType === ReportTypeEnum.SALES_SHOPEE ||
      reportType === ReportTypeEnum.SALES_TIKTOK ||
      reportType === ReportTypeEnum.SALES_LAZADA
    ) {
      isSalesReport = true;

      if (reportType === ReportTypeEnum.SALES_PAID) filter.isPaid = true;
      if (reportType === ReportTypeEnum.SALES_UNPAID) filter.isPaid = false;

      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!data.length) {
      return res.status(400).json({ message: "No data to export" });
    }

    // 🔹 Map totalAmount for sales, 0 for inventory
    data = data.map((item) => ({
      ...item,
      totalAmount: isSalesReport
        ? item.product?.price && item.quantity
          ? item.product.price * item.quantity
          : 0
        : 0, // Inventory reports always return 0
    }));

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
    const productIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("product") || h.toLowerCase().includes("item")
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

// New Report Controllers
// --- 1. Orders Report ---
export const getOrdersReport = async (filters = {}) => {
  console.log("OrdersReportfilters:", filters);
  const { startDate, endDate, paymentStatus, platform } = filters;

  // date filter on orderDate
  const filter = buildDateFilter(startDate, endDate, "orderDate");

  // --- integrate paymentStatus ---
  if (paymentStatus && paymentStatus !== "All") {
    if (paymentStatus === "paid") {
      filter.isPaid = true;
    } else if (paymentStatus === "unpaid") {
      filter.isPaid = false;
    }
  }

  // --- integrate platform ---
  if (platform && platform !== "All") {
    filter.platform = platform.trim().toLowerCase();
  }

  console.log("OrdersReportfilter:", filter);

  const rows = await Order.find(filter)
    .populate({
      path: "product",
      populate: { path: "components.item", model: "Item" },
    })
    .lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ORDERS_REPORT]
  );
};

// --- 2. Products Report ---
export const getProductsReport = async (filters = {}) => {
  console.log("ProductsReportfilters:", filters);
  const { startDate, endDate, status, category, type } = filters;

  // Always apply date filter
  const filter = buildDateFilter(startDate, endDate, "createdAt");

  // Apply optional filters
  if (status && status !== "All") {
    filter.status = status;
  }
  if (type && type !== "All") {
    filter.type = type;
  }

  console.log("ProductsReportfilter:", filter);

  const rows = await Product.find(filter).lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.PRODUCTS_REPORT]
  );
};

// --- 3. Items Report ---
export const getItemsReport = async (filters = {}) => {
  console.log("ItemsReportfilters:", filters);
  const { startDate, endDate, status, supplier, location } = filters;

  // Start with date filter
  const filter = buildDateFilter(startDate, endDate, "createdAt");

  // Add optional filters
  if (status && status !== "All") {
    filter.status = status;
  }

  console.log("ItemsReportfilter:", filter);

  const rows = await Item.find(filter).lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ITEMS_REPORT]
  );
};

// --- 4. Item Movements Report ---
export const getItemMovementsReport = async (filters = {}) => {
  console.log("ItemMovementsReport filters:", filters);

  const { startDate, endDate, type, location, createdBy } = filters;

  // --- Build base filter ---
  const filter = buildDateFilter(startDate, endDate, "updatedAt");

  // --- Optional filters ---
  if (type && type !== "All") {
    filter.type = type; // must be "IN" or "OUT"
  }

  if (location && location !== "All") {
    filter.location = location;
  }

  if (createdBy && createdBy !== "All") {
    filter.createdBy = createdBy;
  }

  console.log("ItemMovementsReport final filter:", filter);

  // --- Query with population ---
  const rows = await ItemMovement.find(filter).populate("item").lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ITEM_MOVEMENTS_REPORT]
  );
};

// --- 5. Inventory Details Report ---
export const getInventoryDetailsReport = async (filters = {}) => {
  console.log("InventoryDetailsReport filters:", filters);

  const { startDate, endDate, movementType, platform, status, courier } =
    filters;

  // --- Base filter ---
  const filter = buildDateFilter(startDate, endDate, "updatedAt");

  // --- Optional filters ---
  if (movementType && movementType !== "All") {
    filter.movementType = movementType;
  }

  if (platform && platform !== "All") {
    filter.platform = platform;
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  console.log("InventoryDetailsReport final filter:", filter);

  // --- Query with population ---
  const rows = await InventoryDetail.find(filter)
    .populate("product")
    .populate("order")
    .lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.INVENTORY_DETAILS_REPORT]
  );
};

// --- General Controller to call the right report ---
export const generateReport = async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      filters: { platform, paymentStatus, movementType, status },
    } = req.body;

    console.log("req.body:", req.body);
    let data;

    switch (reportType) {
      case NewReportTypeEnum.ORDERS_REPORT:
        data = await getOrdersReport({
          startDate,
          endDate,
          platform,
          paymentStatus,
          movementType,
          status,
        });
        // console.log("ORDERS_REPORT:", data);
        break;
      case NewReportTypeEnum.PRODUCTS_REPORT:
        data = await getProductsReport({
          startDate,
          endDate,
          status,
          movementType,
        });
        // console.log("PRODUCTS_REPORT:", data);
        break;
      case NewReportTypeEnum.ITEMS_REPORT:
        data = await getItemsReport({
          startDate,
          endDate,
          status,
        });
        // console.log("ITEMS_REPORT:", data);
        break;
      case NewReportTypeEnum.ITEM_MOVEMENTS_REPORT:
        data = await getItemMovementsReport({
          startDate,
          endDate,
          movementType,
        });
        // console.log("ITEM_MOVEMENTS_REPORT:", data);
        break;
      case NewReportTypeEnum.INVENTORY_DETAILS_REPORT:
        data = await getInventoryDetailsReport({
          startDate,
          endDate,
          platform,
          status,
          movementType,
        });
        // console.log("INVENTORY_DETAILS_REPORT:", data);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Generate Report Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error generating report" });
  }
};

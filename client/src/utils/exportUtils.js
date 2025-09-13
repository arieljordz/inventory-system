// utils/exportUtils.js
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCellValue } from "./reportUtils"; // <-- reuse your formatter

// Helper to format date as MMDDYYYY
const formatDateForFile = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}${dd}${yyyy}`;
};

// Build report filename with optional date range
const buildFileName = (reportName, startDate, endDate, extension) => {
  const start = formatDateForFile(startDate);
  const end = formatDateForFile(endDate);
  let range = "";

  if (start && end) range = `_${start}-${end}`;
  else if (start) range = `_${start}`;
  else if (end) range = `_${end}`;
  else range = `_${new Date().toISOString().slice(0, 10)}`;

  return `${reportName}${range}.${extension}`;
};

// Export to Excel
export const exportToExcel = async (
  data,
  columns,
  reportName = "Report",
  startDate,
  endDate
) => {
  if (!data || data.length === 0 || !columns) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportName);

  // Define columns from your config
  worksheet.columns = columns.map((col) => ({
    header: col.label,
    key: col.key,
    width: col.width || 20,
  }));

  // Add rows with formatting
  data.forEach((row) => {
    const formattedRow = {};
    columns.forEach((col) => {
      formattedRow[col.key] = formatCellValue(row[col.key], col.format);
    });
    worksheet.addRow(formattedRow);
  });

  // Style header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = buildFileName(reportName, startDate, endDate, "xlsx");
  link.click();
};

// Export to PDF
export const exportToPDF = (
  data,
  columns,
  reportName = "Report",
  startDate,
  endDate
) => {
  if (!data || data.length === 0 || !columns) return;

  const orientation = "landscape";

  // Create PDF with orientation
  const doc = new jsPDF({ orientation });

  // Map headers
  const pdfColumns = columns.map((col) => ({
    header: col.label,
    dataKey: col.key,
  }));

  // Map body with formatting, stripping peso sign
  const pdfBody = data.map((row) => {
    const formattedRow = {};
    columns.forEach((col) => {
      let value = formatCellValue(row[col.key], col.format);

      if (typeof value === "string") {
        value = value.replace(/₱/g, "").trim();
      }

      formattedRow[col.key] = value;
    });
    return formattedRow;
  });

  // Add title
  doc.text(reportName, 14, 15);

  // Add table
  autoTable(doc, {
    startY: 20,
    columns: pdfColumns,
    body: pdfBody,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  // Save file
  doc.save(buildFileName(reportName, startDate, endDate, "pdf"));
};

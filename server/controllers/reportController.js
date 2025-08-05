import moment from "moment-timezone";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import {
  ReportTypeEnum,
  MovementTypeEnum,
  StatusEnum,
} from "../enums/enums.js";

export const getReportData = async (req, res) => {
  try {
    const {
      reportType = ReportTypeEnum.INVENTORY,
      startDate,
      endDate,
    } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
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
    }

    let filter = { ...dateFilter };
    let data = [];
    let isSalesReport = false;

    if (
      reportType === ReportTypeEnum.SALES ||
      reportType === ReportTypeEnum.SALES_PAID ||
      reportType === ReportTypeEnum.SALES_UNPAID
    ) {
      isSalesReport = true;

      switch (reportType) {
        case ReportTypeEnum.SALES_PAID:
          filter.isPaid = true;
          break;
        case ReportTypeEnum.SALES_UNPAID:
          filter.isPaid = false;
          break;
        default:
          break;
      }

      data = await Order.find(filter)
        .populate("product", "name serialNumber price")
        .sort({ createdAt: -1 });
    } else {
      switch (reportType) {
        case ReportTypeEnum.INVENTORY_IN:
          filter.movementType = MovementTypeEnum.IN;
          break;
        case ReportTypeEnum.INVENTORY_OUT:
          filter.movementType = MovementTypeEnum.OUT;
          break;
        default:
          break;
      }

      data = await InventoryDetail.find(filter)
        .populate("product", "name serialNumber price")
        .sort({ createdAt: -1 });
    }

    // Compute totalAmount per item
    const tempFormattedData = data.map((item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      const totalAmount = isSalesReport ? price * quantity : 0;

      return {
        ...item.toObject(),
        totalAmount,
      };
    });

    // Calculate the grand total for sales report
    const grandTotalAmount = isSalesReport
      ? tempFormattedData.reduce((sum, item) => sum + item.totalAmount, 0)
      : 0;

    // Attach grandTotalAmount to each item
    const formattedData = tempFormattedData.map((item) => ({
      ...item,
      grandTotalAmount,
    }));

    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

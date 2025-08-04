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

    // console.log("Report Type:", reportType);
    // console.log("Final startDate:", startDate);
    // console.log("Final endDate:", endDate);
    // Build date filter
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

    if (
      reportType === ReportTypeEnum.SALES ||
      reportType === ReportTypeEnum.SALES_PAID ||
      reportType === ReportTypeEnum.SALES_UNPAID
    ) {
      // Sales reports from Order collection
      switch (reportType) {
        case ReportTypeEnum.SALES_PAID:
          filter.isPaid = true;
          break;
        case ReportTypeEnum.SALES_UNPAID:
          filter.isPaid = false;
          break;
        case ReportTypeEnum.SALES:
        default:
          // No need to filter `isPaid`
          break;
      }

      data = await Order.find(filter)
        .populate("product", "name serialNumber price")
        .sort({ createdAt: -1 });
    } else {
      // Inventory reports from InventoryDetail collection
      switch (reportType) {
        case ReportTypeEnum.INVENTORY_IN:
          filter.movementType = MovementTypeEnum.IN;
          break;
        case ReportTypeEnum.INVENTORY_OUT:
          filter.movementType = MovementTypeEnum.OUT;
          break;
        // INVENTORY or default includes all types
      }

      data = await InventoryDetail.find(filter)
        .populate("product", "name serialNumber price")
        .sort({ createdAt: -1 });
    }

    res.json(data);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

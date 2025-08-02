import InventoryDetail from "../models/InventoryDetail.js";
import {
  StatusEnum,
  MovementTypeEnum,
  ReportTypeEnum,
} from "../enums/enums.js";
import moment from "moment-timezone";

export const getReportData = async (req, res) => {
  try {
    const { reportType = ReportTypeEnum.INVENTORY, from, to } = req.query;

    // Build date filter if provided
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) {
        dateFilter.createdAt.$gte = moment
          .tz(from, "Asia/Manila")
          .startOf("day")
          .toDate();
      }
      if (to) {
        dateFilter.createdAt.$lte = moment
          .tz(to, "Asia/Manila")
          .endOf("day")
          .toDate();
      }
    }

    // Fetch inventory details with product info
    const report = await InventoryDetail.find({
      ...dateFilter,
      ...(reportType === ReportTypeEnum.SALES
        ? { movementType: MovementTypeEnum.OUT }
        : {}),
      ...(reportType === ReportTypeEnum.PICKUPS
        ? { status: StatusEnum.FOR_PICK_UP }
        : {}),
    })
      .populate("product", "name serialNumber price")
      .sort({ createdAt: -1 });

    res.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

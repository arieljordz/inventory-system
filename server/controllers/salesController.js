import path from "path";
import xlsx from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  getPlatformMappings,
  validateFile,
  getSheetRows,
  extractOrderIds,
} from "../utils/importUtils.js";

// export const importSalesByPlatform = async (req, res) => {
//   try {
//     // 1. Validate required platform
//     const platform = req.body.platform;
//     if (!platform) {
//       return res.status(400).json({ message: "Platform is required" });
//     }

//     // 2. Get platform-specific field and sheet mappings
//     let mapping;

//     try {
//       mapping = getPlatformMappings(platform, "sales");
//     } catch (err) {
//       return res.status(400).json({ message: err.message });
//     }

//     const { sheetName, fields: fieldMap } = mapping;

//     // 3. Validate uploaded file format and buffer
//     try {
//       validateFile(req.file);
//     } catch (err) {
//       return res.status(400).json({ message: err.message });
//     }

//     // 4. Read and parse the sheet rows using the mapped sheet name
//     let rows;
//     try {
//       rows = getSheetRows(req.file, sheetName);
//     } catch (err) {
//       return res.status(400).json({ message: err.message });
//     }

//     // 5. Extract platformOrderIds from rows using mapped field
//     const { platformOrderId: orderIdKey } = fieldMap;
//     const platformOrderIds = extractOrderIds(rows, orderIdKey);

//     if (platformOrderIds.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No valid order IDs found in file." });
//     }

//     // 6. Fetch matching orders from database
//     const orders = await Order.find({
//       platform,
//       platformOrderId: { $in: platformOrderIds },
//     });

//     const results = {
//       updated: [],
//       alreadyPaid: [],
//       notFound: [],
//     };

//     const orderMap = new Map(orders.map((o) => [o.platformOrderId, o]));

//     // 7. Iterate through uploaded order IDs and update payment status
//     for (const id of platformOrderIds) {
//       const order = orderMap.get(id);

//       if (!order) {
//         results.notFound.push(id);
//         continue;
//       }

//       if (order.isPaid) {
//         results.alreadyPaid.push(order._id);
//         continue;
//       }

//       const before = { isPaid: order.isPaid };

//       order.isPaid = true;
//       await order.save();
//       results.updated.push(order._id);

//       // 8. Log audit trail for updates
//       await logAudit({
//         action: "UPDATE",
//         user: req.user?._id,
//         description: `Marked order ${order._id} as paid via file import (${platform})`,
//         collectionName: "Order",
//         documentId: order._id,
//         before,
//         after: { isPaid: true },
//         ip: req.ip,
//         userAgent: req.get("User-Agent"),
//       });
//     }

//     // 9. Send summary response
//     res.json({
//       message: `${results.updated.length} orders marked as paid.`,
//       summary: {
//         updated: results.updated.length,
//         alreadyPaid: results.alreadyPaid.length,
//         notFound: results.notFound.length,
//       },
//       details: results,
//     });
//   } catch (error) {
//     console.error("Error importing sales:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

export const importSalesByPlatform = async (req, res) => {
  try {
    // 1. Validate platform and get mapping
    const platform = req.body.platform;
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    let mapping;
    try {
      mapping = getPlatformMappings(platform, "sales");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { sheetName, fields: fieldMap } = mapping;

    // 2. Validate uploaded file
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // 3. Auto-detect header row & parse sheet
    let rows;
    try {
      rows = getSheetRows(req.file, sheetName, Object.values(fieldMap));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // 4. Extract platform order IDs
    const platformOrderIds = extractOrderIds(rows, fieldMap.platformOrderId);
    if (platformOrderIds.length === 0) {
      return res.status(400).json({ message: "No valid order IDs found in file." });
    }

    // 5. Fetch matching orders
    const orders = await Order.find({
      platform: platform.toLowerCase(),
      platformOrderId: { $in: platformOrderIds },
    });

    const results = { updated: [], alreadyPaid: [], notFound: [] };
    const orderMap = new Map(orders.map(o => [o.platformOrderId, o]));

    // 6. Update payment status and log
    for (const id of platformOrderIds) {
      const order = orderMap.get(id);

      if (!order) {
        results.notFound.push(id);
        continue;
      }

      if (order.isPaid) {
        results.alreadyPaid.push(order._id);
        continue;
      }

      const before = { isPaid: order.isPaid };
      order.isPaid = true;
      await order.save();

      results.updated.push(order._id);

      await logAudit({
        action: "UPDATE",
        user: req.user?._id,
        description: `Marked order ${order._id} as paid via file import (${platform})`,
        collectionName: "Order",
        documentId: order._id,
        before,
        after: { isPaid: true },
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    // 7. Send summary
    res.json({
      message: `${results.updated.length} orders marked as paid.`,
      summary: {
        updated: results.updated.length,
        alreadyPaid: results.alreadyPaid.length,
        notFound: results.notFound.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Error importing sales:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSalesStatsByDate = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    const todayStart = moment.tz("Asia/Manila").startOf("day").toDate();
    const todayEnd = moment.tz("Asia/Manila").endOf("day").toDate();

    // 1. Get all orders in the given date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("product", "price");

    // 2. Get today's orders only for revenue
    const todaysOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).populate("product", "price");

    let totalSales = 0;
    let unpaidOrders = 0;
    let revenue = 0;

    for (const order of orders) {
      const quantity = order.quantity || 0;
      const price = order.product?.price || 0;
      totalSales += quantity * price;

      if (!order.isPaid) unpaidOrders += 1;
    }

    for (const order of todaysOrders) {
      const quantity = order.quantity || 0;
      const price = order.product?.price || 0;
      revenue += quantity * price;
    }

    res.json({
      totalOrders: orders.length,
      totalSales,
      revenueToday: revenue,
      unpaidOrders,
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({ message: "Failed to get order stats" });
  }
};

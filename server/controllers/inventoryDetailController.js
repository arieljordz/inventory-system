import InventoryDetail from "../models/InventoryDetail.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import moment from "moment-timezone";
import { normalizeString, escapeRegex, normalizeText } from "../utils/commonUtils.js";

export const getRemainingQuantities = async (req, res) => {
  try {
    const products = await Product.find({}).select(
      "name serialNumber quantity"
    );

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching product quantities:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const getInventoryDetailsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!Object.values(StatusEnum).includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const isGrouped = [StatusEnum.AVAILABLE, StatusEnum.OUT_OF_STOCK].includes(
      status
    );

    if (isGrouped) {
      // Fetch directly from Product collection based on status
      const products = await Product.find({ status }).sort({ name: 1 });

      const result = products.map((product) => ({
        product,
        totalQuantity: product.quantity ?? 0,
        status,
        inventoryLogs: [], // Placeholder if needed
      }));

      return res.status(200).json(result);
    }

    // Flat list for other statuses (ON_PROCESS, SHIPPING, etc.)
    const flatDetails = await InventoryDetail.find({ status })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json(flatDetails);
  } catch (error) {
    console.error("Get Inventory Details Error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Server error." });
  }
};

export const getInventoryStats = async (req, res) => {
  const { start, end } = req.query;

  try {
    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    // 1. Count and total quantity of available products
    const availableProducts = await Product.find({
      status: StatusEnum.AVAILABLE,
    });

    const availableProductCount = availableProducts.length;
    const totalAvailableQuantity = availableProducts.reduce(
      (sum, prod) => sum + (prod.quantity || 0),
      0
    );

    // 2. Inventory movements by date range
    const movements = await InventoryDetail.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalIn = movements
      .filter((m) => m.movementType === MovementTypeEnum.IN)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalOut = movements
      .filter((m) => m.movementType === MovementTypeEnum.OUT)
      .reduce((sum, m) => sum + m.quantity, 0);

    res.json({
      availableProductCount,
      totalAvailableQuantity,
      totalIn,
      totalOut,
    });
  } catch (error) {
    console.error("Error getting inventory stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getItemMovements = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = normalizeText((req.query.search || "").trim());
    const { start, end } = req.query;

    const skip = (page - 1) * limit;

    /** 🔹 Date Filter */
    let dateFilter = {};
    if (start && end) {
      const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
      const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ message: "Invalid date range" });
      }

      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    }

    /** 🔹 Search Filter */
    let searchFilter = {};
    if (search) {
      const normalizedSearch = normalizeString(search);
      const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
      const rawSafeRegex = new RegExp(escapeRegex(search), "i");

      if (["IN", "OUT"].includes(search.toUpperCase())) {
        searchFilter = { movementType: search.toUpperCase() };
      } else {
        searchFilter = {
          $or: [
            { "product.normalizedName": safeRegex },
            { "product.normalizedVariant": safeRegex },
            { "product.sku": rawSafeRegex },
            { "product.description": rawSafeRegex },
            { remarks: rawSafeRegex },
          ],
        };
      }
    }

    /** 🔹 Aggregation Pipeline */
    const pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { ...dateFilter, ...searchFilter } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await InventoryDetail.aggregate(pipeline);

    const movements = result[0].data || [];
    const totalMovements = result[0].total[0]?.count || 0;

    res.status(200).json({
      movements,
      totalMovements,
      totalPages: Math.max(Math.ceil(totalMovements / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const tagOrderForPickUp = async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity, 10);
    const platform = req.body.platform?.trim();
    const platformOrderId = req.body.platformOrderId?.trim();
    const courier = req.body.courier?.trim();
    const remarks = req.body.remarks?.trim();

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "A valid quantity is required." });
    }

    if (!courier) {
      return res.status(400).json({ message: "Courier is required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: "Pickup quantity exceeds available stock." });
    }

    const remainingQty = product.quantity - quantity;

    // Create order first
    const order = await Order.create({
      product: product._id,
      quantity,
      platform,
      platformOrderId,
      courier,
      remarks: remarks || "Tagged for pickup",
    });

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        quantity: remainingQty,
        ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
      },
      { new: true }
    );

    // Create inventory detail with order reference
    await InventoryDetail.create({
      product: product._id,
      order: order._id,
      movementType: "OUT",
      quantity,
      courier,
      platform,
      status: StatusEnum.ON_PROCESS,
      remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
    });

    // ✅ Log audit
    await logAudit({
      action: "TAG_FOR_PICKUP",
      user: req.user?._id || null, // assuming you have user attached to request
      description: `Tagged ${quantity} item(s) for pickup.`,
      collectionName: "Product",
      documentId: product._id,
      before: product,
      after: updatedProduct,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      message: `${quantity} item(s) tagged for pickup.`,
      product: updatedProduct,
      order,
    });
  } catch (error) {
    console.error("Tag Product For Pickup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

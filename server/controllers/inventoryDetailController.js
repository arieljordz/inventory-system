import InventoryDetail from "../models/InventoryDetail.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import moment from "moment-timezone";

// GET /api/inventory/remaining-by-product
export const getRemainingQuantities = async (req, res) => {
  try {
    const products = await Product.find({}).select("name serialNumber quantity");

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

    const isGrouped = [StatusEnum.AVAILABLE, StatusEnum.OUT_OF_STOCK].includes(status);

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

    // Flat list for other statuses (FOR_PICK_UP, SHIPPING, etc.)
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

// GET /api/inventory-details/stats?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getInventoryStats = async (req, res) => {
  const { start, end } = req.query;

  try {
    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    const products = await Product.find({});
    const remaining = products.reduce((sum, prod) => sum + (prod.quantity || 0), 0);

    const movements = await InventoryDetail.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalIn = movements
      .filter((m) => m.type === MovementTypeEnum.IN)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalOut = movements
      .filter((m) => m.type === MovementTypeEnum.OUT)
      .reduce((sum, m) => sum + m.quantity, 0);

    res.json({ remaining, totalIn, totalOut });
  } catch (error) {
    console.error("Error getting inventory stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/inventory-details/movements?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getInventoryMovements = async (req, res) => {
  const { start, end } = req.query;

  try {
    // Convert PH time (Asia/Manila) to UTC
    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const movements = await InventoryDetail.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    console.error("Error fetching movements:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const tagOrderForPickUp = async (req, res) => {
  try {
    const { pickupQty, courier, remarks } = req.body;

    if (typeof pickupQty !== "number" || pickupQty <= 0) {
      return res.status(400).json({ message: "A valid pickupQty is required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (pickupQty > product.quantity) {
      return res.status(400).json({ message: "Pickup quantity exceeds available stock." });
    }

    const remainingQty = product.quantity - pickupQty;

    // 1. Create Order
    const order = await Order.create({
      product: product._id,
      quantity: pickupQty,
      courier,
      remarks: remarks || "Tagged for pickup",
    });

    // 2. Update Product
    const updatedFields = {
      quantity: remainingQty,
    };

    // Only mark as OUT_OF_STOCK if no quantity remains
    if (remainingQty === 0) {
      updatedFields.status = StatusEnum.OUT_OF_STOCK;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // 3. Log inventory movement
    await InventoryDetail.create({
      product: product._id,
      movementType: MovementTypeEnum.OUT,
      quantity: pickupQty,
      remarks: `Tagged for pickup - Order ID: ${order._id}`,
      status: StatusEnum.FOR_PICK_UP,
      pickedUpBy: courier,
    });

    return res.status(200).json({
      message: `${pickupQty} item(s) tagged for pickup.`,
      product: updatedProduct,
      order,
    });
  } catch (error) {
    console.error("Tag Product For Pickup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





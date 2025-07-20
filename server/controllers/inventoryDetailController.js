import InventoryDetail from "../models/InventoryDetail.js";
import Product from "../models/Product.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";

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

    if (status === StatusEnum.AVAILABLE) {
      // Group by product
      const groupedDetails = await InventoryDetail.aggregate([
        { $match: { status } },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: "$product",
            product: { $first: "$productDetails" },
            inventoryLogs: {
              $push: {
                _id: "$_id",
                movementType: "$movementType",
                quantity: "$quantity",
                remarks: "$remarks",
                createdAt: "$createdAt"
              }
            }
          }
        },
        { $sort: { "inventoryLogs.createdAt": -1 } }
      ]);

      return res.status(200).json(groupedDetails);
    }

    // Flat list for other statuses
    const details = await InventoryDetail.find({ status })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json(details);
  } catch (error) {
    console.error("Get Inventory Details Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/inventory-details/stats?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getInventoryStats = async (req, res) => {
  const { start, end } = req.query;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate dates
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Normalize end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Remaining = sum of all available product quantities
    const products = await Product.find({});
    const remaining = products.reduce((sum, prod) => sum + (prod.quantity || 0), 0);

    // Movements within range
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
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Normalize end date
    endDate.setHours(23, 59, 59, 999);

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


export const tagForPickUp = async (req, res) => {
  try {
    const { pickupQty } = req.body;

    if (typeof pickupQty !== "number" || pickupQty <= 0) {
      return res
        .status(400)
        .json({ message: "A valid pickupQty is required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (pickupQty > product.quantity) {
      return res
        .status(400)
        .json({ message: "Pickup quantity exceeds available stock." });
    }

    // Update product quantity
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: product.quantity - pickupQty },
      { new: true }
    );

    // Create a single inventory detail record
    await InventoryDetail.create({
      product: product._id,
      movementType: MovementTypeEnum.OUT,
      quantity: pickupQty,
      remarks: "Tagged for pickup",
      status: StatusEnum.FOR_PICK_UP,
      pickedUpBy: "JNT", // Optional: dynamic if needed
    });

    return res.status(200).json({
      message: `${pickupQty} item(s) tagged for pickup.`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Tag Product For Pickup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



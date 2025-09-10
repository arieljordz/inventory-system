import Product from "../models/Product.js";
import Item from "../models/Item.js";
import PriceAdjustment from "../models/PriceAdjustment.js";

// 📌 Apply new adjustment (already implemented)
export const applyAdjustment = async (req, res) => {
  const { targetType, targetId, adjustmentType, valueType, value, notes } =
    req.body;

  const Model = targetType === "Product" ? Product : Item;
  const target = await Model.findById(targetId);
  if (!target) return res.status(404).json({ message: "Target not found" });

  const oldPrice = target.price;
  let newPrice = oldPrice;

  if (adjustmentType === "markup") {
    newPrice =
      valueType === "percentage"
        ? oldPrice + (oldPrice * value) / 100
        : oldPrice + value;
  } else if (adjustmentType === "discount") {
    newPrice =
      valueType === "percentage"
        ? oldPrice - (oldPrice * value) / 100
        : oldPrice - value;
  }

  if (newPrice < 0) newPrice = 0;

  target.price = newPrice;
  await target.save();

  const adjustment = await PriceAdjustment.create({
    targetType,
    targetId,
    adjustmentType,
    valueType,
    value,
    oldPrice,
    newPrice,
    appliedBy: req.user?._id,
    notes,
  });

  res.json({ message: "Adjustment applied", adjustment, newPrice });
};

// 📌 Get all adjustments with pagination & search
export const getAllAdjustments = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";

  const filter = search
    ? {
        $or: [
          { notes: { $regex: search, $options: "i" } },
          { adjustmentType: { $regex: search, $options: "i" } },
          { valueType: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [adjustments, total] = await Promise.all([
    PriceAdjustment.find(filter)
      .populate("targetId", "name sku price")
      .populate("appliedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PriceAdjustment.countDocuments(filter),
  ]);

  res.json({
    data: adjustments,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
  });
};

// 📌 Get adjustments for a specific Product or Item
export const getAdjustmentsByTarget = async (req, res) => {
  const { targetType, targetId } = req.params;

  if (!["Product", "Item"].includes(targetType)) {
    return res.status(400).json({ message: "Invalid target type" });
  }

  const adjustments = await PriceAdjustment.find({ targetType, targetId })
    .populate("appliedBy", "username email")
    .sort({ createdAt: -1 });

  res.json({ data: adjustments });
};

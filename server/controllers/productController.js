import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import cloudinary from "../config/cloudinary.js";
import { generateSKU } from "../utils/skuGenerator.js";
import { logAudit } from "../utils/auditLogger.js";
import { validateFile, getSheetRows } from "../utils/importUtils.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
} from "../utils/commonUtils.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      quantity = 0,
      category = "",
      unit = "pcs",
      supplier = "",
      location = "Main Warehouse",
      status = StatusEnum.AVAILABLE,
      variant = "Default",
      size = "",
    } = req.body;

    const sku = generateSKU({ name, category, variant, size });

    // Check for duplicate Product
    const existingProduct = await Product.findOne({
      normalizedName: normalizeString(normalizeText(name)),
      normalizedVariant: normalizeString(normalizeText(variant) || ""),
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    let imageUrl = "";
    let imageId = "";

    // if (req.file) {
    //   const result = await cloudinary.uploader.upload(req.file.path, {
    //     folder: "products",
    //   });
    //   imageUrl = result.secure_url;
    //   imageId = result.public_id;
    // }

    const newProduct = new Product({
      name,
      price,
      description,
      sku,
      quantity,
      category,
      unit,
      supplier,
      location,
      status,
      variant,
      size,
      image: imageUrl,
      imageId,
    });

    const savedProduct = await newProduct.save();

    // Create an initial inventory record if quantity > 0
    if (quantity > 0) {
      await InventoryDetail.create({
        product: savedProduct._id,
        order: null,
        movementType: MovementTypeEnum.IN,
        quantity,
        remarks: "Initial stock",
        status: savedProduct.status,
        courier: "",
        platform: "",
      });
    }

    // ✅ Log audit
    await logAudit({
      action: "create",
      user: req.user?._id, // assumes you're using auth middleware
      description: `Added new product: ${name}`,
      collectionName: "Product",
      documentId: savedProduct._id,
      after: savedProduct.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const importProducts = async (req, res) => {
  try {
    // 1. Validate file
    validateFile(req.file);

    // 2. Extract rows from sheet (assume sheet has the right headers)
    const expectedFields = [
      "name",
      "description",
      "price",
      "variant",
      "quantity",
      "sku",
    ];
    const rows = getSheetRows(req.file, "products", expectedFields);

    const results = { imported: [], skipped: [] };

    for (const row of rows) {
      // inside for (const row of rows)
      const name = normalizeText(row["name"]?.toString() || "");
      const description = normalizeText(row["description"]?.toString() || "");
      const price = parseFloat(row["price"]);
      const variant = normalizeText(row["variant"]?.toString() || "Default");
      const quantity = parseInt(row["quantity"]) || 0;
      const sku = normalizeText(row["sku"]?.toString() || "");

      // Validation
      if (!name || !description || isNaN(price) || !sku) {
        results.skipped.push({ sku: sku || "N/A", reason: "Invalid row data" });
        continue;
      }

      // Duplicate check using normalizedString (for search-safety)
      const existingProduct = await Product.findOne({
        normalizedName: normalizeString(name),
        normalizedVariant: normalizeString(variant),
        normalizedSku: normalizeString(sku),
      });

      if (existingProduct) {
        results.skipped.push({ name, reason: "Product already exists" });
        continue;
      }

      // Create product
      const product = new Product({
        name,
        description,
        price,
        variant,
        quantity,
        sku,
        normalizedName: normalizeString(name),
        normalizedDescription: normalizeString(description),
        normalizedVariant: normalizeString(variant),
        normalizedSku: normalizeString(sku),
      });

      const savedProduct = await product.save();

      // Create initial inventory detail if stock > 0
      if (quantity > 0) {
        await InventoryDetail.create({
          product: savedProduct._id,
          order: null,
          movementType: MovementTypeEnum.IN,
          quantity,
          remarks: "Initial stock - imported",
          status: savedProduct.status,
          courier: "",
          platform: "",
        });
      }

      results.imported.push(savedProduct);

      // Audit log
      await logAudit({
        action: "IMPORT_PRODUCT",
        user: req.user?._id || null,
        description: `Imported product via Excel: ${name}`,
        collectionName: "Product",
        documentId: savedProduct._id,
        before: null,
        after: savedProduct.toObject(),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    return res.status(200).json({
      message: "Product import completed",
      summary: {
        imported: results.imported.length,
        skipped: results.skipped.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Import Products Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = normalizeText((req.query.search || "").trim());

    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    // Build search query
    const query = search
      ? {
          $or: [
            { normalizedName: safeRegex },
            { normalizedVariant: safeRegex },
            { sku: rawSafeRegex }, // raw but escaped
            { description: rawSafeRegex }, // raw but escaped
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.max(Math.ceil(totalProducts / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsByStatus = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = (req.query.search || "").trim();
    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");
    const { status } = req.params;

    // console.log("search:", search);
    // console.log("normalizedSearch:", normalizedSearch);

    // Validate status
    if (!Object.values(StatusEnum).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Build query with status filter
    const query = {
      status,
      ...(search
        ? {
            $or: [
              { normalizedName: safeRegex },
              { normalizedVariant: safeRegex },
              { sku: rawSafeRegex },
              { description: rawSafeRegex },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.max(Math.ceil(totalProducts / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get Products by Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { sku, quantity, ...updateFields } = req.body;

    // Check for duplicate SKU if sku is being changed
    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ sku, _id: { $ne: productId } });
      if (existing) {
        return res.status(400).json({ message: "SKU already exists" });
      }
      updateFields.sku = sku;
    }

    const requiredFields = ["name", "price", "description"];
    for (const field of requiredFields) {
      if (field in updateFields && !updateFields[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Handle new image upload
    // if (req.file) {
    //   if (product.imageId) {
    //     await cloudinary.uploader.destroy(product.imageId);
    //   }

    //   const result = await cloudinary.uploader.upload(req.file.path, {
    //     folder: "products",
    //   });

    //   updateFields.image = result.secure_url;
    //   updateFields.imageId = result.public_id;
    // }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    // ✅ Log audit
    await logAudit({
      action: "update",
      user: req.user?._id,
      description: `Updated product: ${updatedProduct.name}`,
      collectionName: "Product",
      documentId: updatedProduct._id,
      before: product.toObject(),
      after: updatedProduct.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary if it exists
    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId);
    }

    // Delete the product
    await Product.deleteOne({ _id: req.params.id });

    // Optional: Delete related inventory details
    await InventoryDetail.deleteMany({ product: req.params.id });

    // ✅ Log audit
    await logAudit({
      action: "delete",
      user: req.user?._id,
      description: `Deleted product: ${product.name}`,
      collectionName: "Product",
      documentId: product._id,
      before: product.toObject(),
      after: null,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const restockProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    let { quantity, remarks = "Restock" } = req.body;

    quantity = parseInt(quantity, 10);
    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a number greater than zero" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update quantity
    product.quantity += quantity;

    // Update status if quantity >= 1
    if (product.quantity >= 1 && product.status !== StatusEnum.AVAILABLE) {
      product.status = StatusEnum.AVAILABLE;
    }

    await product.save();

    // Log the restock
    await InventoryDetail.create({
      product: product._id,
      movementType: MovementTypeEnum.IN,
      quantity,
      remarks,
      status: StatusEnum.AVAILABLE,
    });

    // ✅ Log audit
    await logAudit({
      action: "restock",
      user: req.user?._id,
      description: `Restocked product: ${product.name} (+${quantity})`,
      collectionName: "Product",
      documentId: product._id,
      before: product,
      after: product.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({ message: "Product restocked", product });
  } catch (error) {
    console.error("Restock Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductStats = async (req, res) => {
  try {
    // Count total products
    const totalProducts = await Product.countDocuments();

    // Sum total quantity of all products
    const totalQuantityResult = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    // Count products that need restock (e.g. quantity <= 5)
    const needsRestock = await Product.countDocuments({ quantity: { $lte: 5 } });

    // Count products with quantity <= 0 (out of stock)
    const outOfStock = await Product.countDocuments({ quantity: { $lte: 0 } });

    res.json({
      totalProducts,
      totalQuantity: totalQuantityResult[0]?.total || 0,
      needsRestock,
      outOfStock,
    });
  } catch (error) {
    console.error("Get Product Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

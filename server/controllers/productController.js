import Product from "../models/Product.js";
import Item from "../models/Item.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import cloudinary from "../config/cloudinary.js";
import { generateSKU } from "../utils/skuGenerator.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
} from "../utils/commonUtils.js";
import ExcelJS from "exceljs";
import {
  deductBundleComponents,
  updateBundleComponents,
  validateComponents,
} from "../utils/itemUtils.js";

export const addProduct = async (req, res) => {
  try {
    let {
      name,
      price,
      description = "",
      quantity = 0,
      category = "",
      unit = "pcs",
      status = StatusEnum.AVAILABLE,
      variant = "Default",
      type = "bundle",
      components = "[]",
    } = req.body;

    // Normalize fields
    const normalizedName = normalizeString(normalizeText(name));
    const normalizedVariant = normalizeString(normalizeText(variant));

    // Check for duplicate product
    const existingProduct = await Product.findOne({
      normalizedName,
      normalizedVariant,
    });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    // Generate SKU
    const sku = generateSKU({ name, category, variant });

    let newComponents = components;

    // Validate components
    const validComponents = await validateComponents(newComponents);

    // Deduct item quantities if it's a bundle
    // if (type === "bundle" && validComponents.length > 0 && quantity > 0) {
    //   try {
    //     await deductBundleComponents(validComponents, quantity);
    //   } catch (err) {
    //     return res.status(400).json({ message: err.message });
    //   }
    // }

    // Create product
    const newProduct = new Product({
      name,
      price,
      description,
      quantity,
      category,
      unit,
      status,
      variant,
      type,
      sku,
      components: validComponents,
    });

    const savedProduct = await newProduct.save();

    // Create initial inventory record
    if (quantity > 0) {
      await InventoryDetail.create({
        product: savedProduct._id,
        order: null,
        movementType: MovementTypeEnum.IN,
        quantity,
        remarks: type === "bundle" ? "Initial bundle stock" : "Initial stock",
        status: savedProduct.status,
        courier: "",
        platform: "",
      });
    }

    // Audit log
    await logAudit({
      action: "CREATE_PRODUCT",
      user: req.user?._id,
      description: `Added new product: ${name}, variant: ${variant}, type: ${type}`,
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


export const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = normalizeText((req.query.search || "").trim());

    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    // 🔍 Build search query
    const query = search
      ? {
          $or: [
            { normalizedName: safeRegex },
            { normalizedVariant: safeRegex },
            { sku: rawSafeRegex },
            { description: rawSafeRegex },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    // ✅ Fetch products with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        // 👇 populate bundle components
        .populate({
          path: "components.item",
          model: Item,
          select: "name price unit category", // only return needed fields
        }),
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
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { sku, quantity, components = [], ...updateFields } = req.body;

    // console.log("components from req.body:", components);
    // Handle SKU change
    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ sku, _id: { $ne: productId } });
      if (existing)
        return res.status(400).json({ message: "SKU already exists" });
      updateFields.sku = sku;
    }

    // Validate required fields
    ["name", "price", "description"].forEach((field) => {
      if (field in updateFields && !updateFields[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    });

    let newComponents = components;

    // Validate components
    const validComponents = await validateComponents(newComponents);

    // Update bundle components if type is bundle
    // if (product.type === "bundle" && validComponents.length > 0 && quantity !== undefined) {
    //   try {
    //     await updateBundleComponents(product.components, validComponents, product.quantity, quantity);
    //   } catch (err) {
    //     return res.status(400).json({ message: err.message });
    //   }
    // }

    updateFields.components = validComponents;
    if (quantity !== undefined) updateFields.quantity = quantity;

    // console.log("updateFields:", updateFields);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    // Log audit
    await logAudit({
      action: "UPDATE_PRODUCT",
      user: req.user?._id,
      description: `Updated product: ${updatedProduct.name}, variant: ${updatedProduct.variant}`,
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
      action: "DELETE_PRODUCT",
      user: req.user?._id,
      description: `Deleted product: ${product.name}, variant: ${product.variant}`,
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

    const before = product.toObject();

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
      action: "RESTOCK_PRODUCT",
      user: req.user?._id,
      description: `Restocked product: ${product.name}, quantity: ${quantity}, variant: ${product.variant}`,
      collectionName: "Product",
      documentId: product._id,
      before,
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
    const needsRestock = await Product.countDocuments({
      quantity: { $lte: 5 },
    });

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

export const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    // Assuming exported file uses "Products" sheet
    const worksheet = workbook.getWorksheet("Products");
    if (!worksheet) {
      return res.status(400).json({ message: 'Sheet "Products" not found' });
    }

    const results = { imported: [], skipped: [] };

    // Iterate rows, skip header row (first row)
    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      // Map columns according to your export
      const [
        name,
        variant,
        sku,
        category,
        unit,
        supplier,
        location,
        quantity,
        price,
        status,
        description,
        createdAt,
        updatedAt,
      ] = row.values.slice(1); // slice(1) because ExcelJS rows are 1-based with first element empty

      const normalizedName = normalizeString(normalizeText(name || ""));
      const normalizedVariant = normalizeString(
        normalizeText(variant || "Default")
      );
      const normalizedSku = normalizeString(normalizeText(sku || ""));
      const normalizedDescription = normalizeString(
        normalizeText(description || "")
      );

      // Validation
      if (!name || !sku || isNaN(price)) {
        results.skipped.push({
          name: name || "N/A",
          reason: "Invalid row data",
        });
        return;
      }

      // Check duplicates
      const existingProduct = await Product.findOne({
        normalizedName,
        normalizedVariant,
        normalizedSku,
      });
      if (existingProduct) {
        results.skipped.push({ name, reason: "Product already exists" });
        return;
      }

      // Create product
      const product = new Product({
        name,
        variant: variant || "Default",
        sku,
        category: category || "",
        unit: unit || "pcs",
        supplier: supplier || "",
        location: location || "Main Warehouse",
        quantity: parseInt(quantity) || 0,
        price: parseFloat(price),
        status: status || "AVAILABLE",
        description: description || "",
        normalizedName,
        normalizedVariant,
        normalizedSku,
        normalizedDescription,
      });

      const savedProduct = await product.save();
      results.imported.push(savedProduct);

      // Add initial inventory if quantity > 0
      if (savedProduct.quantity > 0) {
        await InventoryDetail.create({
          product: savedProduct._id,
          order: null,
          movementType: MovementTypeEnum.IN,
          quantity: savedProduct.quantity,
          remarks: "Initial stock - imported",
          status: savedProduct.status,
          courier: "",
          platform: "",
        });
      }

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
    });

    res.status(200).json({
      message: "Product import completed",
      summary: {
        imported: results.imported.length,
        skipped: results.skipped.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Import Products Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to import products" });
  }
};

export const exportProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    // Columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Variant", key: "variant", width: 20 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Category", key: "category", width: 20 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Supplier", key: "supplier", width: 25 },
      { header: "Location", key: "location", width: 20 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Price", key: "price", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Description", key: "description", width: 40 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Updated At", key: "updatedAt", width: 20 },
    ];

    // Header style & wrap text
    worksheet.getRow(1).font = { bold: true };
    ["name", "variant", "description"].forEach((col) => {
      worksheet.getColumn(col).alignment = { wrapText: true };
    });
    ["createdAt", "updatedAt"].forEach((col) => {
      worksheet.getColumn(col).numFmt = "yyyy-mm-dd hh:mm:ss";
    });

    // Add rows
    products.forEach((p) => {
      worksheet.addRow({
        ...p,
        createdAt: p.createdAt || null,
        updatedAt: p.updatedAt || null,
      });
    });

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Products Error:", error);
    res.status(500).json({ message: "Failed to export products" });
  }
};

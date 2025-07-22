import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";

// @desc    Add a new product
// @route   POST /api/products
// @access  Public or Protected
export const addProduct = async (req, res) => {
  try {
    const { serialNumber, name, price, description, quantity = 0 } = req.body;
    let imageUrl = "";

    const existingProduct = await Product.findOne({ serialNumber });
    if (existingProduct) {
      return res.status(400).json({ message: "Serial number already exists" });
    }

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary path from multer
    }

    const newProduct = new Product({
      serialNumber,
      name,
      price,
      description,
      image: imageUrl,
      quantity,
    });

    const savedProduct = await newProduct.save();

    // Log initial inventory movement (IN)
    if (quantity > 0) {
      await InventoryDetail.create({
        product: savedProduct._id,
        movementType: MovementTypeEnum.IN,
        quantity,
        remarks: "Initial stock",
        status: StatusEnum.AVAILABLE,
      });
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get products by status
// @route   GET /api/products/status/:status
// @access  Public
export const getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const products = await Product.find({ status }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get Products by Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
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

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { serialNumber, quantity } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Prevent duplicate serial numbers
    const existing = await Product.findOne({
      serialNumber,
      _id: { $ne: productId },
    });
    if (existing) {
      return res.status(400).json({ message: "Serial number already exists" });
    }

    // Optionally log inventory changes if quantity has changed
    const quantityChanged =
      quantity !== undefined && quantity !== product.quantity;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Log inventory movement (IN/OUT) if quantity changed
    if (quantityChanged) {
      const movementType = quantity > product.quantity ? MovementTypeEnum.IN : MovementTypeEnum.OUT;
      const quantityDiff = Math.abs(quantity - product.quantity);

      await InventoryDetail.create({
        product: updatedProduct._id,
        movementType,
        quantity: quantityDiff,
        remarks: `Quantity ${movementType.toLowerCase()} during update`,
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.remove();

    // Optional: Remove associated inventory records
    await InventoryDetail.deleteMany({ product: req.params.id });

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
      return res.status(400).json({ message: "Quantity must be a number greater than zero" });
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

    // Count inventory records with "FOR_PICKUP" status
    const forPickUp = await InventoryDetail.countDocuments({ status: StatusEnum.FOR_PICK_UP });

    // ✅ Count products with quantity <= 0 (out of stock)
    const outOfStock = await Product.countDocuments({ quantity: { $lte: 0 } });

    res.json({
      totalProducts,
      totalQuantity: totalQuantityResult[0]?.total || 0,
      forPickUp,
      outOfStock, // ✅ Added to response
    });
  } catch (error) {
    console.error("Get Product Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



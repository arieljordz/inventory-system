import dotenv from "dotenv";
dotenv.config(); // Load env variables early

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js"; 
import inventoryDetailRoutes from "./routes/inventoryDetailRoutes.js"; 
import reportRoutes from "./routes/reportRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ===== Middleware =====
app.use(cors({
  origin: process.env.BASE_URL, // e.g., http://localhost:5173
  credentials: true,            // Allow cookies
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("🚀 Backend API is running");
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory-details", inventoryDetailRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales", salesRoutes);

// Optional: Serve static files if you're storing images locally
// app.use("/uploads", express.static("uploads"));

// ===== Server Listen =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// At the bottom of your main server file 
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("Only Excel") || err.message.includes("file")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});
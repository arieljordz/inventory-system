import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

// ===== Routes =====
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryDetailRoutes from "./routes/inventoryDetailRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== Connect to MongoDB =====
connectDB();

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.BASE_URL, // e.g., http://localhost:5173
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== API Routes =====
app.get("/api", (req, res) => {
  res.send("🚀 Backend API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory-details", inventoryDetailRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales", salesRoutes);

// Optional: Serve static files if you're storing images locally
// app.use("/uploads", express.static("uploads"));

// ===== Serve React Frontend =====
const buildPath = path.join(__dirname, "../client/build");

if (process.env.NODE_ENV === "production") {
  // Serve static files from build
  app.use(express.static(buildPath));

  // Handle React Router routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 Backend API is running (dev mode)");
  });
}

// ===== Error Handler =====
app.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    (err.message &&
      (err.message.includes("Only Excel") || err.message.includes("file")))
  ) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

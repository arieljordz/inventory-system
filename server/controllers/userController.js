// controllers/userController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { logAudit } from "../utils/auditLogger.js";
import { UserRoleEnum } from "../enums/enums.js";

// --- Create a user ---
export const createUser = async (req, res) => {
  try {
    const { name, email, picture, password, isVerified, role } = req.body;

    // 🔹 Prevent duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 🔹 Hash password if provided
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // 🔹 Create user
    const user = await User.create({
      name,
      email,
      picture,
      password: hashedPassword,
      isVerified,
      role,
    });

    // 🔹 Log audit
    await logAudit({
      action: "CREATE_USER",
      user: req.user?._id,
      description: `Created user: ${user.name} (${user.email})`,
      collectionName: "User",
      documentId: user._id,
      after: user.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Create User Error:", err);
    res.status(500).json({ message: err.message || "Failed to create user" });
  }
};

// --- Get all users with pagination + search ---
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch users" });
  }
};

// --- Get single user ---
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch user" });
  }
};

// --- Update user ---

export const updateUser = async (req, res) => {
  try {
    const { name, email, picture, password, isVerified, role } = req.body;

    const beforeUser = await User.findById(req.params.id);
    if (!beforeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Prepare update object
    const updateData = { name, email, picture, isVerified, role };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // 🔹 Log audit
    await logAudit({
      action: "UPDATE_USER",
      user: req.user?._id,
      description: `Updated user: ${updatedUser.name} (${updatedUser.email})`,
      collectionName: "User",
      documentId: updatedUser._id,
      before: beforeUser.toObject(),
      after: updatedUser.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Update User Error:", err);
    res.status(500).json({ message: err.message || "Failed to update user" });
  }
};

// --- Delete user ---
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Log audit
    await logAudit({
      action: "DELETE_USER",
      user: req.user?._id,
      description: `Deleted user: ${user.name} (${user.email})`,
      collectionName: "User",
      documentId: user._id,
      before: user.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete User Error:", err);
    res.status(500).json({ message: err.message || "Failed to delete user" });
  }
};

import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import { normalizeString, escapeRegex } from "../utils/commonUtils.js";

export const getAllAuditLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || "").trim();

    const skip = (page - 1) * limit;

    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    // Step 1: Find matching user IDs when searching
    let matchingUserIds = [];

    if (search) {
      const matchingUsers = await AuditLog.db
        .collection("users")
        .find(
          {
            $or: [
              { name: rawSafeRegex },
              { email: rawSafeRegex },
            ],
          },
          {
            projection: { _id: 1 },
          }
        )
        .toArray();

      matchingUserIds = matchingUsers.map((user) => user._id);
    }

    // Step 2: Convert search to ObjectId if valid
    let searchObjectId = null;

    if (mongoose.Types.ObjectId.isValid(search)) {
      searchObjectId = new mongoose.Types.ObjectId(search);
    }

    // Step 3: Build audit log search query
    const searchConditions = [
      { action: rawSafeRegex },
      { description: rawSafeRegex },
      { collectionName: rawSafeRegex },
      { ip: rawSafeRegex },
      { userAgent: rawSafeRegex },
    ];

    if (matchingUserIds.length > 0) {
      searchConditions.push({
        user: { $in: matchingUserIds },
      });
    }

    if (searchObjectId) {
      searchConditions.push({
        documentId: searchObjectId,
      });
    }

    const match = search
      ? { $or: searchConditions }
      : {};

    // Step 4: Count matching audit logs
    const totalLogs = await AuditLog.countDocuments(match);

    // Step 5: Retrieve current page using indexed sorting
    const pageLogs = await AuditLog.find(match)
      .select("_id")
      .sort({ createdAt: -1, _id: -1 })
      .hint({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pageIds = pageLogs.map((log) => log._id);

    // Step 6: Retrieve audit log details and user information
    let logs = [];

    if (pageIds.length > 0) {
      const enrichedLogs = await AuditLog.aggregate([
        {
          $match: {
            _id: { $in: pageIds },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      // Preserve original sorting
      const logsMap = new Map(
        enrichedLogs.map((log) => [
          String(log._id),
          log,
        ])
      );

      logs = pageLogs
        .map((log) => logsMap.get(String(log._id)))
        .filter(Boolean);
    }

    res.status(200).json({
      logs,
      totalLogs,
      totalPages: Math.max(Math.ceil(totalLogs / limit), 1),
      currentPage: page,
      pageSize: limit,
    });

  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
import AuditLog from "../models/AuditLog.js";
import { normalizeString, escapeRegex } from "../utils/commonUtils.js";

export const getAllAuditLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || "").trim();
    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    const skip = (page - 1) * limit;

    // Build search query
    const match = search
      ? {
          $or: [
            { action: rawSafeRegex },
            { description: rawSafeRegex },
            { collectionName: rawSafeRegex },
            { ip: rawSafeRegex },
            { userAgent: rawSafeRegex },
          ],
        }
      : {};

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await AuditLog.aggregate(pipeline);
    const logs = result[0].data;
    const totalLogs = result[0].total[0]?.count || 0;

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

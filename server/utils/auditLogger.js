import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({
  action,
  user = null,
  description = "",
  collectionName,
  documentId,
  before = null,
  after = null,
  ip = "",
  userAgent = "",
}) => {
  try {
    await AuditLog.create({
      action,
      user,
      description,
      collectionName,
      documentId,
      before,
      after,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
    // Optional: write to file or external log service
  }
};

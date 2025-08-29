import React from "react";
import { formatDateTime, truncateText } from "../../utils/commonUtils";
import CopyToClipboardButton from "../../components/common/CopyToClipboardButton";

const AuditLogsTable = ({ auditLogs = [], loading = false }) => {
  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading audit logs...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!auditLogs || auditLogs.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-file-alt fa-2x mb-2 d-block"></i>
              No audit logs found
            </div>
          </td>
        </tr>
      );
    }

    return auditLogs.map((log, index) => (
      <tr key={log._id || index} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">{log.action || "-"}</td>
        <td className="text-center align-middle">
          {log.user ? log.user.name.toUpperCase() : "-"}
        </td>
        <td className="text-center align-middle">{log.collectionName || "-"}</td>
        <td className="text-center align-middle">
          {log.documentId ? (
            <div className="d-flex align-items-center justify-content-center">
              <code className="pr-2" title={log.documentId}>
                {truncateText(log.documentId, 80)}
              </code>
              <CopyToClipboardButton text={log.documentId} />
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            <div className="pr-2" title={log.description || ""}>
              {truncateText(log.description, 80)}
            </div>
            {log.description && <CopyToClipboardButton text={log.description} />}
          </div>
        </td>
        <td className="text-center align-middle">{log.ip || "-"}</td>
        <td className="text-center align-middle">
          <small className="text-muted">{formatDateTime(log.createdAt)}</small>
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-file-alt mr-2"></i>
          Audit Logs
        </h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="thead-light">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>#</th>
                <th className="text-center" style={{ width: "120px" }}>Action</th>
                <th className="text-center" style={{ width: "150px" }}>User</th>
                <th className="text-center" style={{ width: "150px" }}>Collection</th>
                <th className="text-center" style={{ width: "150px" }}>Document ID</th>
                <th>Description</th>
                <th className="text-center" style={{ width: "120px" }}>IP</th>
                <th className="text-center" style={{ width: "150px" }}>Date</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsTable;

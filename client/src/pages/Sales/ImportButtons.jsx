
import React from "react";

const ImportButtons = ({ loading, onImportSales, onImportReturned }) => {
  return (
    <div className="mb-3 d-flex align-items-center gap-2">
      {/* Import button sales */}
      <button
        className="btn btn-success"
        onClick={onImportSales}
        disabled={loading}
      >
        <i className="fas fa-file-import mr-1"></i> Import Sales
      </button>

      {/* Import button returned */}
      <button
        className="btn btn-warning"
        onClick={onImportReturned}
        disabled={loading}
      >
        <i className="fas fa-file-import mr-1"></i> Import Returned
      </button>
    </div>
  );
};

export default ImportButtons;

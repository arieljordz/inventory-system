import React, { useRef, useCallback } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { exportProducts } from "../../services/productService";

function ProductExport() {
  const { showSpinner, hideSpinner } = useSpinner();
  const buttonRef = useRef(null);

  const handleExport = useCallback(async () => {
    try {
      showSpinner();
      const response = await exportProducts(); 
      // Ensure exportProducts axios call uses: { responseType: "arraybuffer" }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Products exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(err.response?.data?.message || "Failed to export Products.");
    } finally {
      hideSpinner();
    }
  }, [showSpinner, hideSpinner]);

  return (
    <div className="d-flex justify-content-start">
      {/* Hidden button, can trigger programmatically */}
      <Button
        ref={buttonRef}
        className="hide"
        variant="info"
        onClick={handleExport}
      >
        <i className="fas fa-file-export mr-1"></i> Export Products
      </Button>
    </div>
  );
}

export default ProductExport;

import React, { useRef, useCallback } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { importProducts } from "../../services/productService";

function ProductImport({ fetchProducts }) {
  const { showSpinner, hideSpinner } = useSpinner();
  const fileInputRef = useRef(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = useCallback(
    async (file) => {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        showSpinner();
        const { data } = await importProducts(formData);
        const { details } = data;

        if (details?.skipped?.length) {
          const skippedMessages = details.skipped.map(
            (item, idx) =>
              `#${idx + 1} (${item.name}): ${item.reason}`
          );

          Swal.fire({
            icon: "warning",
            title: "Import Completed with Issues",
            html: `<div style="max-height:300px; overflow:auto">${skippedMessages.join(
              "<br>"
            )}</div>`,
            width: "40em",
          });
        } else {
          toast.success("Products imported successfully!");
        }

        await fetchProducts?.();
      } catch (err) {
        console.error("Import failed:", err);
        toast.error(
          err.response?.data?.message || "Failed to import Products."
        );
      } finally {
        hideSpinner();
        resetFileInput();
      }
    },
    [fetchProducts, showSpinner, hideSpinner]
  );

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    handleImport(file);
  };

  return (
    <div>
      {/* hidden input */}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {/* button is hidden by default */}
      <div className="d-flex justify-content-start">
        <Button
          className="hide" // 👈 hidden by default
          variant="success"
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fas fa-file-import mr-1"></i> Choose File
        </Button>
      </div>
    </div>
  );
}

export default ProductImport;

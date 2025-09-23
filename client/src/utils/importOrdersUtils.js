import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { toProperCase } from "./commonUtils";

// Show Order Import Results
export const showOrderImportResults = (details, platform) => {
  const rows = [];

  if (details?.imported?.length) {
    details.imported.forEach((item, idx) => {
      rows.push(buildOrderRow(idx, item, "imported"));
    });
  }

  if (details?.skipped?.length) {
    details.skipped.forEach((item, idx) => {
      rows.push(buildOrderRow(idx, item, "skipped"));
    });
  }

  showImportResults(
    rows,
    `${toProperCase(platform)} Import Results`,
    "Orders imported successfullys!"
  );
};

// Copy button builder
const buildCopyButton = (platformOrderId) => {
  return `
    <button 
      class="copy-btn" 
      data-order-id="${platformOrderId}"
      title="Copy Order ID"
      style="margin-left:6px; background:none; border:none; cursor:pointer; font-size:14px; color:#3886fcff;">
      <i class="fa fa-copy"></i>
    </button>
  `;
};

// Build a single Order row for the result table
const buildOrderRow = (idx, item, type = "imported") => {
  let remarks = "";
  let color = "red";

  if (type === "imported") {
    // console.log("reason:", item.reason);
    remarks = item.reason;
    color = "green";
  } else {
    switch (item.reason) {
      case "Product not found":
        remarks = item.reason;
        color = "orange";
        break;
      case "Order already imported":
        remarks = item.reason;
        color = "blue";
        break;
      default:
        remarks = item.reason || "Skipped";
    }
  }

  return `
    <tr>
      <td style="padding:6px; border:1px solid #ccc; text-align:center;">${
        idx + 1
      }</td>
      <td style="padding:6px; border:1px solid #ccc;">
        ${item.platformOrderId}
        ${buildCopyButton(item.platformOrderId)}
      </td>
      <td style="padding:6px; border:1px solid #ccc; color:${color}">${remarks}</td>
    </tr>
  `;
};

// Show import results
const showImportResults = (rows, title, successMessage) => {
  // console.log("rows:", rows);
  if (rows.length > 0) {
    Swal.fire({
      title,
      html: `
        <div style="max-height:300px; overflow:auto; text-align:left">
          <table style="border-collapse: collapse; width:100%; font-size:14px;">
            <thead>
              <tr>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; text-align:center; color:white;">#</th>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white; width:250px;">Order ID</th>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join("")}
            </tbody>
          </table>
        </div>
      `,
      width: "40em",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        document.querySelectorAll(".copy-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const orderId = btn.getAttribute("data-order-id");
            navigator.clipboard.writeText(orderId).then(() => {
              // highlight by changing color
              const originalColor = btn.style.color;
              btn.style.color = "green";

              // revert back after 2 seconds
              setTimeout(() => {
                btn.style.color = originalColor;
              }, 2000);
            });
          });
        });
      },
    });
  } else {
    toast.success(successMessage);
  }
};



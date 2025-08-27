import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Build one table row
const buildOrderRow = (idx, item, type = "imported") => {
  let remarks = "";
  let color = "black";

  if (type === "imported") {
    remarks = "Imported Order";
    color = "green";
  } else {
    switch (item.reason) {
      case "Product not found":
        remarks = item.reason;
        color = "red";
        break;
      case "Order already imported":
        remarks = item.reason;
        color = "blue";
        break;
      case "Insufficient stock":
        remarks = item.reason;
        color = "orange";
        break;
      default:
        remarks = item.reason || "Skipped";
    }
  }

  return `
    <tr>
      <td style="padding:4px; border:1px solid #ccc; text-align:center;">${idx + 1}</td>
      <td style="padding:4px; border:1px solid #ccc;">${item.platformOrderId}</td>
      <td style="padding:4px; border:1px solid #ccc; color:${color}">${remarks}</td>
    </tr>
  `;
};

// Main helper
export const showOrderImportResults = (details) => {
  const rows = [];

  if (details?.imported?.length) {
    details.imported.forEach((item, idx) => {
      rows.push(buildOrderRow(idx, item, "imported"));
    });
  }

  if (details?.skipped?.length) {
    details.skipped.forEach((item, idx) => {
      rows.push(buildOrderRow(details.imported?.length + idx, item, "skipped"));
    });
  }

  if (rows.length > 0) {
    Swal.fire({
      icon: "info",
      title: "Import Results",
      html: `
        <div style="max-height:300px; overflow:auto; text-align:left">
          <table style="border-collapse: collapse; width:100%; font-size:14px;">
            <thead>
              <tr>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; text-align:center; color:white;">#</th>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white;">Order ID</th>
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
    });
  } else {
    toast.success("Orders imported successfully!");
  }
};


// Build one table row
const buildSalesRow = (idx, id, type = "paid") => {
  let remarks = "";
  let color = "green";

  if (type === "paid") {
    remarks = "Paid Successfully";
    color = "green";
  } else {
    remarks = "Not Found / Unpaid";
    color = "red";
  }

  return `
    <tr>
      <td style="padding:4px; border:1px solid #ccc; text-align:center;">${idx + 1}</td>
      <td style="padding:4px; border:1px solid #ccc;">${id}</td>
      <td style="padding:4px; border:1px solid #ccc; color:${color}">${remarks}</td>
    </tr>
  `;
};

// Main helper
export const showSalesImportResults = (details, message) => {
  const rows = [];

  if (details?.alreadyPaid?.length) {
    details.alreadyPaid.forEach((id, idx) => {
      rows.push(buildSalesRow(idx, id, "paid"));
    });
  }

  if (details?.notFound?.length) {
    details.notFound.forEach((id, idx) => {
      rows.push(buildSalesRow(details.alreadyPaid?.length + idx, id, "unpaid"));
    });
  }

  if (rows.length > 0) {
    Swal.fire({
      icon: "info",
      title: "Import Results",
      html: `
        <div style="max-height:300px; overflow:auto; text-align:left">
          <table style="border-collapse: collapse; width:100%; font-size:14px;">
            <thead>
              <tr>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; text-align:center; color:white;">#</th>
                <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white;">Order ID</th>
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
    });
  } else {
    toast.success(message || "Sales imported successfully!");
  }
};

// Merged code from both helpers above
// import Swal from "sweetalert2";
// import { toast } from "react-toastify";

// const buildRow = (idx, item, type, context = "sales") => {
//   let remarks = "";
//   let color = "black";

//   if (context === "sales") {
//     if (type === "paid") {
//       remarks = "Paid Successfully";
//       color = "green";
//     } else {
//       remarks = "Not Found / Unpaid";
//       color = "red";
//     }
//     return `
//       <tr>
//         <td style="padding:4px; border:1px solid #ccc; text-align:center;">${idx + 1}</td>
//         <td style="padding:4px; border:1px solid #ccc;">${item}</td>
//         <td style="padding:4px; border:1px solid #ccc; color:${color}">${remarks}</td>
//       </tr>
//     `;
//   }

//   if (context === "orders") {
//     if (type === "imported") {
//       remarks = "Imported Order";
//       color = "green";
//     } else {
//       switch (item.reason) {
//         case "Product not found":
//           remarks = item.reason;
//           color = "red";
//           break;
//         case "Order already imported":
//           remarks = item.reason;
//           color = "blue";
//           break;
//         case "Insufficient stock":
//           remarks = item.reason;
//           color = "orange";
//           break;
//         default:
//           remarks = item.reason || "Skipped";
//       }
//     }
//     return `
//       <tr>
//         <td style="padding:4px; border:1px solid #ccc; text-align:center;">${idx + 1}</td>
//         <td style="padding:4px; border:1px solid #ccc;">${item.platformOrderId}</td>
//         <td style="padding:4px; border:1px solid #ccc; color:${color}">${remarks}</td>
//       </tr>
//     `;
//   }
// };

// // --- Main helper ---
// export const showImportResults = (context, details, message) => {
//   const rows = [];

//   if (context === "sales") {
//     if (details?.alreadyPaid?.length) {
//       details.alreadyPaid.forEach((id, idx) => {
//         rows.push(buildRow(idx, id, "paid", "sales"));
//       });
//     }

//     if (details?.notFound?.length) {
//       details.notFound.forEach((id, idx) => {
//         rows.push(buildRow(details.alreadyPaid?.length + idx, id, "unpaid", "sales"));
//       });
//     }
//   }

//   if (context === "orders") {
//     if (details?.imported?.length) {
//       details.imported.forEach((item, idx) => {
//         rows.push(buildRow(idx, item, "imported", "orders"));
//       });
//     }

//     if (details?.skipped?.length) {
//       details.skipped.forEach((item, idx) => {
//         rows.push(buildRow(details.imported?.length + idx, item, "skipped", "orders"));
//       });
//     }
//   }

//   if (rows.length > 0) {
//     Swal.fire({
//       icon: "info",
//       title: "Import Results",
//       html: `
//         <div style="max-height:300px; overflow:auto; text-align:left">
//           <table style="border-collapse: collapse; width:100%; font-size:14px;">
//             <thead>
//               <tr>
//                 <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; text-align:center; color:white;">#</th>
//                 <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white;">
//                   ${context === "sales" ? "Sales ID" : "Order ID"}
//                 </th>
//                 <th style="padding:6px; border:1px solid #ebf3ffff; background:#3886fcff; color:white;">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${rows.join("")}
//             </tbody>
//           </table>
//         </div>
//       `,
//       width: "40em",
//     });
//   } else {
//     toast.success(message || `${context === "sales" ? "Sales" : "Orders"} imported successfully!`);
//   }
// };

// import { showImportResults } from "./importHelpers";
// showImportResults("sales", details, message);
// showImportResults("orders", details);
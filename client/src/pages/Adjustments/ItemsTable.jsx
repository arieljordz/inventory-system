import React from "react";
import { formatAmount, truncateText } from "../../utils/commonUtils";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

const ItemsTable = ({ list, loading, onAdjust, ActionButtons, TableStateRow }) => (
  <table className="table table-hover table-striped mb-0">
    <thead className="thead-light">
      <tr>
        <th className="text-center">#</th>
        <th className="text-center">SKU</th>
        <th className="text-left">Name</th>
        <th className="text-center">Variant</th>
        <th className="text-right">Adjusted Price</th>
        <th className="text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {loading || !list.length ? (
        <TableStateRow loading={loading} activeTab="items" />
      ) : (
        list.map((item, index) => (
          <tr key={item._id}>
            <td className="text-center align-middle">{index + 1}</td>
            <td className="text-center align-middle">
              <code className="px-2 py-1 rounded">{item.sku || "N/A"}</code>
            </td>
            <td className="align-middle">
              <div className="d-flex align-items-center">
                <div className="font-weight-medium" title={item.name || ""}>
                  <code className="px-2 py-1 rounded">
                    {truncateText(item.name, 60)}{" "}
                    {item.variant && `(${item.variant})`}
                  </code>
                </div>
                <CopyToClipboardButton text={item.name} />
              </div>
            </td>
            <td className="text-center align-middle">
              {item.variant ? (
                <span className="badge badge-secondary">{item.variant}</span>
              ) : (
                <span className="text-muted">-</span>
              )}
            </td>
            <td className="text-right align-middle">
              <span className="font-weight-bold">{formatAmount(item.price)}</span>
            </td>
            <td className="text-center align-middle">
              <ActionButtons item={item} loading={loading} onAdjust={onAdjust} type="Item" />
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default ItemsTable;

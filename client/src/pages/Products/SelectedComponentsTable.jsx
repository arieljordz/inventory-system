import React from "react";
import { Table, Button, FormControl } from "react-bootstrap";

const SelectedComponentsTable = ({ components, updateQty, removeItem }) => {
  return (
    <div className="table-responsive" style={{ maxHeight: "250px" }}>
      <Table bordered size="sm" className="mb-0 table-sm text-center">
        <thead>
          <tr>
            <th style={{ width: "340px" }}>Item Name</th>
            <th>Qty per Bundle</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {components.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center">
                No components selected
              </td>
            </tr>
          ) : (
            components.map((comp, index) => {
              const itemId =
                typeof comp.item === "object" ? comp.item._id : comp.item;

              const itemName =
                typeof comp.item === "object"
                  ? `${comp.item.name} (${comp.item.variant})`
                  : `${comp.name} (${comp.variant})`;

              return (
                <tr key={itemId || index}>
                  <td style={{ width: "170px" }}>{itemName}</td>
                  <td>
                    <FormControl
                      type="number"
                      min="1"
                      value={comp.qty}
                      onChange={(e) => updateQty(itemId, e.target.value)}
                      className="text-center"
                      style={{ height: "30px" }}
                    />
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeItem(itemId)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SelectedComponentsTable;

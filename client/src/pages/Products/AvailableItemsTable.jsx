import React from "react";
import { Table, Button, Pagination } from "react-bootstrap";

const AvailableItemsTable = ({
  items,
  components,
  addItem,
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div>
      <div className="table-responsive" style={{ maxHeight: "250px" }}>
        <Table bordered size="sm" className="mb-0 table-sm text-center">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isAdded = components.some((c) => {
                const id = typeof c.item === "object" ? c.item._id : c.item;
                return id === item._id;
              });

              return (
                <tr key={item._id || index}>
                  <td>{`${item.name} (${item.variant})`}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => addItem(item)}
                      disabled={isAdded}
                    >
                      {isAdded ? "Added" : "Add"}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-2">
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
          <Pagination.Prev
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === page}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          />
          <Pagination.Last
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
};

export default AvailableItemsTable;

export const PasswordEnum = Object.freeze({
  DEFAULT_PASS: "DefaultPass123!",
});

export const StatusEnum = Object.freeze({
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
  FOR_PICK_UP: "For Pick Up",
  TO_SHIP: "To Ship",
  SHIPPING: "Shipping",
  RETURNED: "Returned",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
});

export const MovementTypeEnum = Object.freeze({
  IN: "IN",
  OUT: "OUT",
});

export const UnitTypeEnum = Object.freeze({
  PIECE: "pcs",
});

export const ReportTypeEnum = Object.freeze({
  INVENTORY: "INVENTORY",
  INVENTORY_IN: "INVENTORY_IN",
  INVENTORY_OUT: "INVENTORY_OUT",
  SALES: "SALES",
  SALES_PAID: "SALES_PAID",
  SALES_UNPAID: "SALES_UNPAID",
  SALES_SHOPEE: "SALES_SHOPEE",
  SALES_TIKTOK: "SALES_TIKTOK",
  SALES_LAZADA: "SALES_LAZADA",
});

export const PlatformEnum = Object.freeze({
  SHOPEE: "Shopee",
  TIKTOK: "Tiktok",
  LAZADA: "Lazada",
});

export const CourierEnum = Object.freeze({
  SPX: "Standard Local-SPX Express",
  JNT: "Standard Local-J&T Express",
  LBC: "Standard Local-LBC Express",
});
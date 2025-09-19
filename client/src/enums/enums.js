export const PasswordEnum = Object.freeze({
  DEFAULT_PASS: "DefaultPass123!",
});

export const StatusEnum = Object.freeze({
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
  ON_PROCESS: "On Process",
  RETURNED: "Returned",
  COMPLETED: "Completed",
});

export const MovementTypeEnum = Object.freeze({
  IN: "IN",
  OUT: "OUT",
});

export const PaymentStatusEnum = Object.freeze({
  PAID: "Paid",
  UNPAID: "Unpaid",
});

export const UnitTypeEnum = Object.freeze({
  PIECE: "pcs",
});

export const ReportTypeEnum = Object.freeze({
  ORDERS: "ORDERS",
  PRODUCTS_IN: "PRODUCTS_IN",
  PRODUCTS_OUT: "PRODUCTS_OUT",
  SALES: "SALES",
  SALES_PAID: "SALES_PAID",
  SALES_UNPAID: "SALES_UNPAID",
  SALES_SHOPEE: "SALES_SHOPEE",
  SALES_TIKTOK: "SALES_TIKTOK",
  SALES_LAZADA: "SALES_LAZADA",
  ITEMS: "ITEMS",
  ITEMS_IN: "ITEMS_IN",
  ITEMS_OUT: "ITEMS_OUT",
});

export const NewReportTypeEnum = Object.freeze({
  ORDERS_REPORT: "Orders Report",
  WALK_INS_REPORT: "Walk-Ins Report",
  PRODUCTS_REPORT: "Products Report",
  PRODUCT_MOVEMENTS_REPORT: "Product Movements Report",
  ITEMS_REPORT: "Items Report",
  ITEM_MOVEMENTS_REPORT: "Item Movements Report",
  PROFITS_REPORT: "Costs & Profits Report",
  ADJUSTMENTS_REPORT: "Price Adjustments Report",
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

export const PaymentMethodEnum = Object.freeze({
  CASH: "Cash",
  GCASH: "GCash",
  BANK_TRANSFER: "Bank Transfer",
});

export const TargetTypeEnum = Object.freeze({
  PRODUCT_TYPE: "Product",
  ITEM_TYPE: "Item",
});

export const ShopNameEnum = Object.freeze({
  LHANZSHOP: "S-LHANZSHOP",
  ARNSHOP: "S-ARNSHOP",
  T_SHOP: "T-SHOP",
  L_SHOP: "L-SHOP",
});

export const VerificationCodeEnum = Object.freeze({
  VERIFICATION_CODE: "1245",
});

export const UserRoleEnum = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});
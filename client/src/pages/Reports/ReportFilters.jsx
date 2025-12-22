import React, { useMemo } from "react";
import { TextInput, SelectInput } from "../../components/FormInputs";
import {
  NewReportTypeEnum,
  PaymentStatusEnum,
  MovementTypeEnum,
  PlatformEnum,
  StatusEnum,
  PaymentMethodEnum,
  TargetTypeEnum,
} from "../../enums/enums";

// 🔹 Mapping report type → filters
const SHOW_FILTERS = {
  [NewReportTypeEnum.ORDERS_REPORT]: [
    "orderId",
    "platform",
    "paymentStatus",
    "status",
  ],
  [NewReportTypeEnum.WALK_INS_REPORT]: ["buyerName", "paymentMethod"],
  [NewReportTypeEnum.FREEBIES_REPORT]: ["buyerName"],
  [NewReportTypeEnum.PRODUCTS_REPORT]: ["status"],
  [NewReportTypeEnum.ITEMS_REPORT]: ["status"],
  [NewReportTypeEnum.ITEM_MOVEMENTS_REPORT]: ["movementType"],
  [NewReportTypeEnum.PRODUCT_MOVEMENTS_REPORT]: [
    "orderId",
    "platform",
    "movementType",
  ],
  [NewReportTypeEnum.PROFITS_REPORT]: [
    "orderId",
    "platform",
    "paymentStatus",
    "status",
  ],
  [NewReportTypeEnum.ADJUSTMENTS_REPORT]: [
    "targetType",
    "itemName",
    "shopName",
  ],
};

// 🔹 Enum → Select options
const FILTER_OPTIONS = {
  platform: Object.values(PlatformEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
  paymentStatus: Object.values(PaymentStatusEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
  movementType: Object.values(MovementTypeEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
  status: Object.values(StatusEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
  paymentMethod: Object.values(PaymentMethodEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
  targetType: Object.values(TargetTypeEnum).map((v) => ({
    label: v,
    value: v.toLowerCase(),
  })),
};

// 🔹 Labels
const FILTER_LABELS = {
  platform: "Platform",
  paymentStatus: "Payment Status",
  movementType: "Movement Type",
  status: "Status",
  orderId: "Order ID",
  buyerName: "Buyer Name",
  paymentMethod: "Payment Method",
  targetType: "Target Type",
  itemName: "Product/Item Name",
  shopName: "Shop Name",
};

// 🔹 Input config (decides if it's text or select)
const FILTER_CONFIG = {
  orderId: { type: "text", placeholder: "Enter order ID" },
  buyerName: { type: "text", placeholder: "Enter buyer name" },
  itemName: { type: "text", placeholder: "Enter product/item name" },
  shopName: { type: "text", placeholder: "Enter shop name" },
  platform: { type: "select" },
  paymentStatus: { type: "select" },
  movementType: { type: "select" },
  status: { type: "select" },
  paymentMethod: { type: "select" },
  targetType: { type: "select" },
};

const ReportFilters = ({
  reportType,
  setReportType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filters,
  handleFilterChange,
  onGenerate,
  onResetFilters,
  loading,
}) => {
  const reportOptions = useMemo(
    () => Object.values(NewReportTypeEnum).map((v) => ({ label: v, value: v })),
    []
  );

  const activeFilters = SHOW_FILTERS[reportType] || [];

  // 🔹 Unified renderer for filters
  const renderFilter = (key) => {
    const config = FILTER_CONFIG[key];
    const label = FILTER_LABELS[key];
    const value = filters[key] || "";

    if (!config) return null;

    if (config.type === "text") {
      return (
        <TextInput
          key={key}
          label={label}
          name={key}
          value={value}
          onChange={handleFilterChange}
          placeholder={config.placeholder}
        />
      );
    }

    if (config.type === "select") {
      return (
        <SelectInput
          key={key}
          label={label}
          name={key}
          value={value}
          onChange={handleFilterChange}
          options={[
            { label: "All", value: "" },
            ...(FILTER_OPTIONS[key] || []),
          ]}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* 🔹 Top Row: Report Type + Date Range */}
      <div className="row g-3">
        <div className="col-md-2">
          <SelectInput
            label="Report Type"
            value={reportType || ""}
            onChange={(e) => setReportType(e.target.value)}
            options={reportOptions}
            required
          />
        </div>

        <div className="col-md-2">
          <TextInput
            label="Start Date"
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-2">
          <TextInput
            label="End Date"
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 🔹 Dynamic Filters + Buttons */}
      <div className="row g-3">
        {activeFilters.map((key) => (
          <div className="col-md-2" key={key}>
            {renderFilter(key)}
          </div>
        ))}

        {/* Buttons */}
        <div className="col-md-2 pt-4">
          <button
            className="btn btn-secondary btn-block mt-2"
            onClick={onResetFilters}
            disabled={loading}
          >
            <i className="fas fa-undo mr-1"></i>
            Reset Filters
          </button>
        </div>
        <div className="col-md-2 pt-4">
          <button
            className="btn btn-success btn-block mt-2"
            onClick={onGenerate}
            disabled={loading}
          >
            <i className="fas fa-sync-alt mr-1"></i>
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportFilters;

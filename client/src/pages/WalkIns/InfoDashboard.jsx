import React from "react";
import { formatAmount } from "../../utils/commonUtils";
import { InfoBox } from "../../components/FormInputs";

function InfoDashboard({ stats }) {
  return (
    <div>
      <div className="row">
        {/* Total Sales (₱) */}
        <InfoBox
          icon="fas fa-coins"
          label="Monthly Sales"
          value={formatAmount(stats.totalSales ?? 0)}
          color="success"
        />

        {/* Transactions Count */}
        <InfoBox
          icon="fas fa-receipt"
          label="Monthly Transactions"
          value={stats.transactionCount ?? 0}
          color="info"
        />

        {/* Average Transaction Value */}
        <InfoBox
          icon="fas fa-calculator"
          label="Avg. Transaction Value"
          value={formatAmount(stats.avgTransactionValue ?? 0)}
          color="primary"
        />

        {/* Top Selling Item */}
        <InfoBox
          icon="fas fa-star"
          label="Top Selling Item"
          value={
            stats.topSellingItem
              ? `${stats.topSellingItem.name} (${stats.topSellingItem.quantity})`
              : "N/A"
          }
          color="warning"
        />
      </div>
    </div>
  );
}

export default InfoDashboard;

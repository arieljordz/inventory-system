import React from "react";
import { formatAmount } from "../../utils/commonUtils";
import { InfoBox } from "../../components/FormInputs";

function InfoDashboard({ stats }) {
  return (
    <div>
      <div className="row">
        {/* Transactions Count */}

        <InfoBox
          icon="fas fa-box"
          label="Transactions"
          value={stats.transactionCount ?? 0}
          color="success"
        />

        {/* Total Sales (₱) */}
        <InfoBox
          icon="fas fa-money-bill-wave"
          label="Total Value"
          value={formatAmount(stats.totalReferenceValue ?? 0)}
          color="info"
        />

        {/* Average Transaction */}
        <InfoBox
          icon="fas fa-chart-line"
          label="Avg. Transaction"
          value={formatAmount(stats.avgTransactionValue ?? 0)}
          color="primary"
        />

        {/* Top Selling Item */}
        <InfoBox
          icon="fas fa-star"
          label="Top Item"
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

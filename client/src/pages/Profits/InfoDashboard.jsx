import React from "react";
import { InfoBox } from "../../components/FormInputs";
import { formatAmount } from "../../utils/commonUtils";

function InfoDashboard({ stats }) {
  return (
    <div>
      <div className="row">
        <InfoBox
          icon="fas fa-shopping-cart"
          label="Overall Orders"
          value={stats.overallOrders ?? 0}
          color="primary"
        />
        <InfoBox
          icon="fas fa-money-bill-wave"
          label="Overall Cost"
          value={formatAmount(stats.overallCost) ?? 0}
          color="info"
        />
        <InfoBox
          icon="fas fa-wallet"
          label="Overall Revenue"
          value={formatAmount(stats.overallRevenue) ?? 0}
          color="success"
        />
        <InfoBox
          icon="fas fa-chart-line"
          label="Overall Profit"
          value={formatAmount(stats.overallProfit) ?? 0}
          color="danger"
        />
      </div>
    </div>
  );
}

export default InfoDashboard;

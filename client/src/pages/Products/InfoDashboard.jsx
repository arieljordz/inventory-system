import React from "react";
import { InfoBox } from "../../components/FormInputs";

function InfoDashboard({ stats }) {
  // console.log("Stats:", stats);
  return (
    <div>
      <div className="row">
        <InfoBox
          icon="fas fa-layer-group"
          label="Unique Products"
          value={stats.availableProductCount ?? 0}
          color="primary"
        />
        <InfoBox
          icon="fas fa-boxes"
          label="Remaining Qty (Total)"
          value={stats.totalAvailableQuantity ?? 0}
          color="info"
        />
        <InfoBox
          icon="fas fa-arrow-circle-down"
          label="Total In (Today)"
          value={stats.totalInToday ?? 0}
          color="success"
        />
        <InfoBox
          icon="fas fa-arrow-circle-up"
          label="Total Out (Today)"
          value={stats.totalOutToday ?? 0}
          color="danger"
        />
      </div>
    </div>
  );
}

export default InfoDashboard;

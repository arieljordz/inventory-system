import React from "react";
import { InfoBox } from "../../components/FormInputs";

function InfoDashboard({ stats }) {
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
          label="Total In"
          value={stats.totalIn ?? 0}
          color="success"
        />
        <InfoBox
          icon="fas fa-arrow-circle-up"
          label="Total Out"
          value={stats.totalOut ?? 0}
          color="danger"
        />
      </div>
    </div>
  );
}

export default InfoDashboard;

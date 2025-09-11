import React from "react";
import { InfoBox } from "../../components/FormInputs";

function InfoDashboard({ stats }) {
  return (
    <div>
      <div className="row">
        <InfoBox
          icon="fas fa-shopping-cart"
          label="Overall Orders"
          value={stats.overall ?? 0}
          color="primary"
        />
        <InfoBox
          icon="fas fa-box-open"
          label="Shopee Orders"
          value={stats.shopee ?? 0}
          color="info"
        />
        <InfoBox
          icon="fas fa-gift"
          label="Tiktok Orders"
          value={stats.tiktok ?? 0}
          color="success"
        />
        <InfoBox
          icon="fas fa-store"
          label="Lazada Orders"
          value={stats.lazada ?? 0}
          color="danger"
        />
      </div>
    </div>
  );
}

export default InfoDashboard;

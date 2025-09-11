import React from "react";
import PlatformOrdersTable from "./PlatformOrdersTable";
import WalkInTransactionsTable from "./WalkInTransactionsTable";

const ProfitsTable = ({ list = [], onView, activeTab, loading = false }) => {
  if (activeTab === "platform-orders") {
    return (
      <PlatformOrdersTable
        list={list}
        onView={onView}
        loading={loading}
      />
    );
  }

  return (
    <WalkInTransactionsTable
      list={list}
      onView={onView}
      loading={loading}
    />
  );
};

export default ProfitsTable;

import React, { useState } from "react";
import Navpath from "../../components/Navpath";
import SettingsBackups from "./SettingsBackups";
import SettingsSupports from "./SettingsSupports";
import SettingsFlags from "./SettingsFlags";
import SettingsTabs from "./SettingsTabs";
import SettingsCommissions from "./SettingsCommissions";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("backup");

  const renderContent = () => {
    switch (activeTab) {
      case "backup":
        return <SettingsBackups />;
      case "feature-flag":
        return <SettingsFlags />;
      case "support":
        return <SettingsSupports />;
      case "commission":
        return <SettingsCommissions />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navpath
        levelOne="Settings"
        levelTwo="System"
        levelThree="Configuration"
      />

      <section className="content">
        <div className="container-fluid">
          <div className="card shadow-sm">
            {/* Tabs */}
            <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

            <div className="card-body">{renderContent()}</div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SettingsPage;

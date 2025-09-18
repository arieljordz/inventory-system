import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { getFeatureFlags } from "../../services/settingsService";

const SettingsFlags = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        const res = await getFeatureFlags();
        console.log("res:", res);
        setFlags(res.data || []);
      } catch (error) {
        console.error("Failed to load feature flags", error);
        toast.error("Failed to load feature flags");
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  return (
    <div className="container mt-3">
      <h4 className="mb-3">⚙️ Feature Flags</h4>

      {loading ? (
        <p>Loading flags...</p>
      ) : flags.length === 0 ? (
        <div className="alert alert-info">No feature flags found</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "40%" }}>Feature</th>
                  <th style={{ width: "40%" }}>Description</th>
                  <th className="text-center" style={{ width: "20%" }}>
                    Enabled
                  </th>
                </tr>
              </thead>
              <tbody>
                {flags.map(({ key, name, description, enabled }) => (
                  <tr key={key}>
                    <td>{name}</td>
                    <td className="text-muted">{description}</td>
                    <td className="text-center">
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={enabled}
                          readOnly
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsFlags;

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import {
  getFeatureFlags,
  updateFeatureFlag,
} from "../../services/settingsService";

const SettingsFlags = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch feature flags
  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        const res = await getFeatureFlags();
        setFlags(res.data || []);
      } catch (error) {
        console.error("Failed to load feature flags", error);
        toast.error("Failed to load feature flags");
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [showSpinner, hideSpinner]);

  // Handle toggle
  const handleToggle = async (key, currentValue) => {
    try {
      showSpinner();
      const newValue = !currentValue;

      await updateFeatureFlag(key, newValue);

      // Update UI optimistically
      setFlags((prevFlags) =>
        prevFlags.map((flag) =>
          flag.key === key ? { ...flag, enabled: newValue } : flag
        )
      );

      toast.success(`Feature flag '${key}' updated successfully`);
    } catch (error) {
      console.error("Failed to update feature flag", error);
      toast.error("Failed to update feature flag");
    } finally {
      hideSpinner();
    }
  };

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
                    <td>{name || key}</td>
                    <td className="text-muted">
                      {description || "No description"}
                    </td>
                    <td className="text-center">
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleToggle(key, enabled)}
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

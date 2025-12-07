import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { TextInput } from "../../components/FormInputs";
import { useSpinner } from "../../context/SpinnerContext";
import { getCommission, updateCommission } from "../../services/settingsService";

const SettingsCommissions = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [commission, setCommission] = useState(""); // percentage string
  const [loading, setLoading] = useState(true);

  // 🔍 Load commission on mount
  useEffect(() => {
    const loadCommission = async () => {
      try {
        showSpinner();
        const data = await getCommission();

        if (data?.value !== undefined) {
          setCommission((data.value * 100).toString()); // 0.25 → "25"
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load commission settings.");
      } finally {
        hideSpinner();
        setLoading(false);
      }
    };

    loadCommission();
  }, []);

  // 💾 Save updated commission
  const handleUpdate = async () => {
    if (!commission.trim()) {
      toast.error("Please enter a commission percentage.");
      return;
    }

    const numeric = parseFloat(commission);
    if (isNaN(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Commission must be between 0 and 100.");
      return;
    }

    const commissionRate = numeric / 100; // Convert 25 → 0.25

    try {
      showSpinner();
      await updateCommission(commissionRate);
      toast.success("Commission updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update commission.");
    } finally {
      hideSpinner();
    }
  };

  return (
    <div className="container mt-3">
      <h4 className="mb-3">🛠 Commission Settings</h4>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card p-3" style={{ maxWidth: "400px" }}>
          <label className="fw-bold mb-1">Commission (%)</label>

          <TextInput
            type="number"
            placeholder="Enter percentage (e.g., 25)"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
          />

          <button className="btn btn-primary mt-3" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsCommissions;

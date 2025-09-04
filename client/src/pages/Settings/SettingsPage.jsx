import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/Navpath";
import {
  getCollections,
  backupCollections,
  downloadBackup,
} from "../../services/settingsService";

const SettingsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(["all"]);
  const [backups, setBackups] = useState([]);
  const [backupFolder, setBackupFolder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCollections()
      .then((res) => setCollections(res.data))
      .catch(() => toast.error("Failed to fetch collections"));
  }, []);

  const handleBackup = async () => {
    try {
      setLoading(true);
      showSpinner();
      const res = await backupCollections(selected);

      setBackups(res.data.backups);
      setBackupFolder(res.data.folder);
      toast.success("Backup completed!");
    } catch (err) {
      toast.error("Backup failed");
    } finally {
      setLoading(false);
      hideSpinner();
    }
  };

  const handleDownload = async (filePath, showToast = true) => {
    try {
      const res = await downloadBackup(filePath);
      const fileName = filePath.split("/").pop();

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (showToast) {
        toast.success(`Downloaded: ${fileName}`);
      }
      return true;
    } catch (err) {
      if (showToast) {
        toast.error(`Download failed: ${filePath}`);
      }
      return false;
    }
  };

  const handleDownloadAll = async () => {
    if (!backupFolder || backups.length === 0) {
      toast.error("No backup files found");
      return;
    }

    try {
      for (const b of backups) {
        await handleDownload(b.file, false);
      }
      toast.success("All backups downloaded!");
    } catch {
      toast.error("Some files failed to download");
    }
  };

  return (
    <>
      <Navpath levelOne="Settings" levelTwo="System" levelThree="Backup" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Manual Backup Section */}
            <div className="col-6">
              <div className="card p-3">
                <h5>Manual Backup</h5>
                <div className="form-group">
                  <label>Select Collections</label>
                  <select
                    multiple
                    size={15}
                    className="form-control"
                    value={selected}
                    onChange={(e) =>
                      setSelected(
                        [...e.target.selectedOptions].map((o) => o.value)
                      )
                    }
                  >
                    <option value="all">All Collections</option>
                    {collections.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleBackup}
                  disabled={loading}
                >
                  <i className="fas fa-database mr-2"></i>
                  {loading ? "Backing up..." : "Start Backup"}
                </button>
              </div>
            </div>

            {/* Backup Results Section */}
            <div className="col-6">
              {backups.length > 0 && (
                <div className="card p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Backup Results</h5>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={handleDownloadAll}
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download All
                    </button>
                  </div>
                  <ul className="list-group">
                    {backups.map((b, i) => (
                      <li
                        key={i}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="text-adaptive">
                          <i className="fas fa-folder mr-2 text-muted"></i>
                          {b.collection} ({b.count} docs)
                        </span>
                        {/* <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleDownload(b.file)}
                        >
                          <i className="fas fa-file-download mr-1"></i>
                          Download
                        </button> */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SettingsPage;

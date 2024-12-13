import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Use the same CSS file as Dashboard
import "./SystemSettings.css";
import { useEffect } from "react";
import kadeText from "../images/kade2.png"; // Logo image


const SystemSettings = () => {
  const navigate = useNavigate();

  // State for different settings
  const [shopName, setShopName] = useState("");
  const [logo, setLogo] = useState(null);
  const [contactInfo, setContactInfo] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [backupFile, setBackupFile] = useState(null);

  // Handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/settings");
        if (response.ok) {
          const data = await response.json();
          setShopName(data.shopName || "");
          setLogo(data.logo || null);
          setContactInfo(data.contactInfo || "");
          setTaxRate(data.taxRate || 0);
          setDiscount(data.discount || 0);
          setEmailAlerts(data.emailAlerts || false);
        } else {
          console.error("Failed to load settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
  
    fetchSettings();
  }, []);

  const handleSignOut = () => navigate("/SignIn");

  const handleBackupUpload = (e) => {
    setBackupFile(e.target.files[0]);
  };

  const handleSaveSettings = async () => {
    const settings = {
      shopName,
      logo,
      contactInfo,
      taxRate,
      discount,
      emailAlerts,
    };

    try {
      const response = await fetch("http://localhost:5000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      alert("Error saving settings: " + error.message);
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupFile) {
      alert("Please upload a backup file.");
      return;
    }

    const formData = new FormData();
    formData.append("backupFile", backupFile);

    try {
      const response = await fetch("http://localhost:5000/api/restore", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Backup restored successfully!");
      } else {
        alert("Failed to restore backup.");
      }
    } catch (error) {
      alert("Error restoring backup: " + error.message);
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
         <h2 className="sidebar-title">
                  <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li className="sidebar-item" onClick={() => navigate("/ProductManagement")}>Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>Inventory Monitoring</li>
          <li className="sidebar-item">Supplier Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item">System Settings</li>
          <li className="sidebar-item logout" onClick={handleSignOut}>
            Sign Out
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>System Settings</h1>
        <div className="settings-container">
          {/* Shop Details */}
          <div className="setting-item">
            <label>Shop Name:</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>Shop Logo:</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logo && <img src={logo} alt="Logo" className="preview" />}
          </div>
          <div className="setting-item">
            <label>Contact Info:</label>
            <textarea
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            ></textarea>
          </div>

          {/* Tax and Discounts */}
          <div className="setting-item">
            <label>Tax Rate (%):</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>Discount (%):</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          {/* Notification Preferences */}
          <div className="setting-item">
            <label>Email Alerts for Low Stock:</label>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
            />
          </div>

          {/* Backup and Restore */}
          <div className="setting-item">
            <label>Restore Backup:</label>
            <input type="file" onChange={handleBackupUpload} />
            <button onClick={handleRestoreBackup}>Restore</button>
          </div>
        </div>
        <button onClick={handleSaveSettings} className="save-button">
          Save Settings
        </button>
      </main>
    </div>
  );
};

export default SystemSettings;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./Dashboard.css";
import kadeText from "../images/kade2.png"; // Logo image

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || { name: "Kade.lk", email: "kadelk@gmail.com", profilePicture: null };
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query.");
      return;
    }
    alert(`Searching for: ${searchQuery}`);
  };

  const handleSignOut = () => navigate("/SignIn");

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newMode);
    setIsDarkMode(!isDarkMode);
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDelete = () => setProfilePicture(null);

  // Example data for charts
const visitorData = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      label: "Visitors",
      data: [100, 200, 150, 300, 250, 400],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

const salesData = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  datasets: [
    {
      label: "Sales",
      data: [5000, 10000, 7500, 12000],
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
  ],
};

const customerSatisfactionData = {
  labels: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
  datasets: [
    {
      data: [45, 30, 15, 10],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const productPerformanceData = {
  labels: ["Product A", "Product B", "Product C"],
  datasets: [
    {
      data: [300, 150, 200],
      backgroundColor: [
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)",
      ],
      borderColor: [
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(255, 205, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
};


  return (
    <div className={`dashboard ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <aside className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul className="sidebar-menu">
        
        <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>Dashboard</li>
        <li className="sidebar-item" onClick={() => navigate("/ProductManagement")}>Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>Inventory Monitoring</li>
          <li className="sidebar-item" onClick={() => navigate("/SupplierManagement")}>Supplier Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>Reorder Management</li>
          <li className="sidebar-item" onClick={() => navigate("/UserManagement")}>User Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReportingAndAnalytics")}>Reporting And Analytics</li>
          <li className="sidebar-item" onClick={() => navigate("/SystemSettings")}>System Settings</li>
          <li className="sidebar-item logout" onClick={handleSignOut}>
            Sign Out
          </li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <button className="toggle-mode" onClick={toggleDarkMode}>
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          <div className="user-info">
            {profilePicture ? (
              <div className="profile">
                <img src={profilePicture} alt="Profile" className="profile-pic" />
                <br></br>
                <button onClick={handleProfileDelete}>Delete</button>
              </div>
            ) : (
              <label className="upload-label">
                Upload Profile Picture
                <input type="file" accept="image/*" onChange={handleProfileUpload} />
              </label>
            )}
            <br></br>
            <span>{user.name}</span>
            <span>{user.email}</span>
          </div>
        </header>
        {/* Rest of the code */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>🔍</button>
        </div>
        <div className="dashboard-panels">
          {/* Visitor Insights */}
          <div className="panel">
            <h3>Visitor Insights</h3>
            <Line data={visitorData} options={{ responsive: true }} />
          </div>

          {/* Total Revenue */}
          <div className="panel">
            <h3>Total Revenue</h3>
            <Bar data={salesData} options={{ responsive: true }} />
          </div>

          {/* Customer Satisfaction */}
          <div className="panel">
            <h3>Customer Satisfaction</h3>
            <Pie data={customerSatisfactionData} options={{ responsive: true }} />
          </div>

          {/* Product Performance */}
          <div className="panel">
            <h3>Product Performance</h3>
            <Pie data={productPerformanceData} options={{ responsive: true }} />
          </div>
            
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

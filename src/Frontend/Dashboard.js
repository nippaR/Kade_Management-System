import React, { useState, useEffect } from "react";
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
import kadeText from "../images/kade2.png"; // Importing the logo image

// Registering necessary ChartJS components
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
  const user = location.state?.user || { name: "Guest", email: "guest@example.com", profilePicture: null };
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // State to toggle dark mode

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query.");
      return;
    }
    alert(`Searching for: ${searchQuery}`);
  };

  const handleSignOut = () => {
    navigate("/SignIn");
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await fetch("http://localhost:5000/api/users/upload-profile-picture", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Profile picture uploaded successfully!");
        const data = await response.json();
        user.profilePicture = data.profilePicture;
        window.location.reload();
      } else {
        alert("Failed to upload profile picture.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const newMode = isDarkMode ? "light" : "dark";
    htmlElement.setAttribute("data-theme", newMode);
    setIsDarkMode(!isDarkMode); // Update state
  };

  // Sample data for Visitor Insights
  const visitorData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Loyal Customers",
        data: [200, 300, 400, 350, 450, 500, 600, 700, 750, 800, 850, 900],
        borderColor: "#4CAF50",
        fill: false,
      },
      {
        label: "New Customers",
        data: [150, 200, 250, 300, 350, 400, 450, 400, 350, 300, 250, 200],
        borderColor: "#2196F3",
        fill: false,
      },
      {
        label: "Unique Customers",
        data: [100, 150, 200, 250, 300, 350, 300, 250, 200, 150, 100, 50],
        borderColor: "#FF9800",
        fill: false,
      },
    ],
  };

  // Sample data for Total Revenue
  const salesData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Total Revenue",
        data: [5000, 10000, 7500, 12000],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"],
      },
    ],
  };

  // Sample data for Customer Satisfaction
  const customerSatisfactionData = {
    labels: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
    datasets: [
      {
        data: [50, 30, 10, 5, 5],
        backgroundColor: ["#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800", "#F44336"],
      },
    ],
  };

  // Sample data for Product Performance
  const productPerformanceData = {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        data: [300, 200, 150, 100],
        backgroundColor: ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0"],
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
          <li className="sidebar-item">Dashboard</li>
          <li className="sidebar-item">Product Management</li>
          <li className="sidebar-item">Sales Management</li>
          <li className="sidebar-item">Inventory Monitoring</li>
          <li className="sidebar-item">Supplier Management</li>
          <li className="sidebar-item">Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
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
            {user.profilePicture && (
              <img
                src={`http://localhost:5000/uploads/${user.profilePicture}`}
                alt="Profile"
                className="profile-image"
              />
            )}
            <span>{user.name}</span>
            <span>{user.email}</span>
            <input type="file" accept="image/*" onChange={handleProfilePictureUpload} />
          </div>
        </header>
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

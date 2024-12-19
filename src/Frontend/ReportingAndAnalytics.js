import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx"; // Excel export
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";
import kadeText from "../images/kade2.png";

// ChartJS modules registration
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

const ReportingAndAnalytics = () => {
  const navigate = useNavigate();

  // State for sales and inventory data
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  const [inventoryData, setInventoryData] = useState({
    labels: [],
    datasets: [],
  });

  // Fetch data from the backend
  useEffect(() => {
    // Fetch sales data
    fetch("http://localhost:5000/stock-movements")
      .then((res) => res.json())
      .then((data) => {
        const labels = data.stockMovements.map((item) =>
          new Date(item.date).toLocaleDateString()
        );
        const revenueData = data.stockMovements
          .filter((item) => item.type === "sale")
          .map((item) => item.totalPrice);

        setSalesData({
          labels,
          datasets: [
            {
              label: "Total Revenue",
              data: revenueData,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error("Error fetching sales data:", err));

    // Fetch inventory data
    fetch("http://localhost:5000/products/low-stock")
      .then((res) => res.json())
      .then((data) => {
        const lowStockCount = data.lowStockProducts.length;
        const outOfStockCount = data.lowStockProducts.filter(
          (item) => item.stock === 0
        ).length;

        const fastMoving = Math.max(10, 100 - lowStockCount - outOfStockCount);

        setInventoryData({
          labels: ["Fast-Moving", "Low Stock", "Out of Stock"],
          datasets: [
            {
              data: [fastMoving, lowStockCount, outOfStockCount],
              backgroundColor: [
                "rgba(75, 192, 192, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 206, 86, 0.6)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error("Error fetching inventory data:", err));
  }, []);

  // Export report as PDF
  const exportPDF = () => {
    const input = document.getElementById("report-container");
    html2canvas(input).then((canvas) => {
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 10, 180, 160);
      pdf.save("report.pdf");
    });
  };

  // Export report as Excel
  const exportExcel = () => {
    const data = [
      ["Sales Report"],
      ["Date", "Total Revenue"],
      ...salesData.labels.map((label, index) => [
        label,
        salesData.datasets[0].data[index],
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "SalesReport.xlsx");
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/ProductManagement")}
          >
            Product Management
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/SalesTracking")}
          >
            Sales Management
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/inventoryMonitoring")}
          >
            Inventory Monitoring
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/SupplierManagement")}
          >
            Supplier Management
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/ReorderManagement")}
          >
            Reorder Management
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/UserManagement")}
          >
            User Management
          </li>
          <li className="sidebar-item active">Reporting and Analytics</li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/SystemSettings")}
          >
            System Settings
          </li>
          <li
            className="sidebar-item logout"
            onClick={() => navigate("/SignIn")}
          >
            Sign Out
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Reporting and Analytics</h1>
        </header>

        <div id="report-container" className="dashboard-panels">
          {/* Sales Reports */}
          <div className="panel">
            <h3>Sales Reports</h3>
            {salesData.datasets.length > 0 ? (
              <Bar data={salesData} options={{ responsive: true }} />
            ) : (
              <p>Loading sales data...</p>
            )}
          </div>

          {/* Inventory Reports */}
          <div className="panel">
            <h3>Inventory Reports</h3>
            {inventoryData.datasets.length > 0 ? (
              <Pie data={inventoryData} options={{ responsive: true }} />
            ) : (
              <p>Loading inventory data...</p>
            )}
          </div>

          {/* Export Options */}
          <div className="panel">
            <h3>Export Reports</h3>
            <button onClick={exportPDF}>Export as PDF</button>
            <button onClick={exportExcel}>Export as Excel</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportingAndAnalytics;

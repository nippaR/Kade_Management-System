import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./ReorderManagement.css";
import kadeText from "../images/kade2.png"; // Logo image

const ReorderManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reorderList, setReorderList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchLowStockProducts();
    fetchSuppliers();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/products/low-stock");
      if (!response.ok) throw new Error("Failed to fetch low-stock products.");
      const data = await response.json();
      setProducts(data.lowStockProducts || []);
    } catch (error) {
      console.error("Error fetching low-stock products:", error);
      alert("Could not fetch low-stock products.");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers.");
      const data = await response.json();
      setSuppliers(
        data.suppliers.map((sup) => ({
          value: sup.email,
          label: sup.email,
        }))
      );
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      alert("Could not fetch suppliers.");
    }
  };

  const addToReorderList = (product) => {
    const alreadyInList = reorderList.some((item) => item.productId === product.productId);
    if (!alreadyInList) {
      setReorderList((prev) => [
        ...prev,
        { ...product, reorderQuantity: product.reorderLevel - product.stock },
      ]);
    }
  };

  const markAsProcessed = async () => {
    try {
      await Promise.all(
        reorderList.map(async (item) => {
          const response = await fetch("http://localhost:5000/stock-movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              type: "restock",
              quantity: item.reorderQuantity,
            }),
          });
          if (!response.ok) throw new Error(`Failed to log stock movement for ${item.name}`);
        })
      );
      alert("Reorder processed successfully!");
      setReorderList([]);
      fetchLowStockProducts();
    } catch (error) {
      console.error("Error processing reorder:", error);
      alert("Error processing reorder.");
    }
  };

  const notifySuppliers = async () => {
    if (!selectedSupplier) {
      alert("Please select a supplier to notify.");
      return;
    }

    if (reorderList.length === 0) {
      alert("Reorder list is empty. Add products to reorder before notifying.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/notify-supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedSupplier.value,
          reorderItems: reorderList.map((item) => ({
            name: item.name,
            reorderQuantity: item.reorderQuantity,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to notify supplier.");
      alert(`Notification sent to ${selectedSupplier.label}`);
    } catch (error) {
      console.error("Error notifying supplier:", error);
      alert("Failed to notify supplier.");
    }
  };

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newMode);
    setIsDarkMode(!isDarkMode);
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
          <li className="sidebar-item">Reorder Management</li>
          <li className="sidebar-item" onClick={() => navigate("/UserManagement")}>User Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReportingAndAnalytics")}>Reporting And Analytics</li>
          <li className="sidebar-item" onClick={() => navigate("/SystemSettings")}>System Settings</li>
          <li className="sidebar-item logout" onClick={() => navigate("/SignIn")}>Sign Out</li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Reorder Management</h1>
          <button className="toggle-mode" onClick={toggleDarkMode}>
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </header>
        <div className="content-section">
          <h2>Low Stock Products</h2>
          {products.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                    <td>{product.reorderLevel}</td>
                    <td>
                      <button onClick={() => addToReorderList(product)}>Add to Reorder List</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No low stock products available.</p>
          )}

          <h2>Reorder List</h2>
          {reorderList.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Reorder Quantity</th>
                </tr>
              </thead>
              <tbody>
                {reorderList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.reorderQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items in reorder list.</p>
          )}

          <button onClick={markAsProcessed}>Mark as Processed</button>
          <Select
            className="supplier-select"
            options={suppliers}
            placeholder="Select Supplier"
            onChange={setSelectedSupplier}
          />
          <button onClick={notifySuppliers}>Notify Suppliers</button>
        </div>
      </main>
    </div>
  );
};

export default ReorderManagement;

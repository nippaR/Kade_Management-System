import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReorderManagement.css";
import kadeText from "../images/kade2.png";

const ReorderManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reorderList, setReorderList] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch Low Stock Products on Component Mount
  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/products/low-stock"); // Ensure this URL is correct
      if (!response.ok) {
        throw new Error("Failed to fetch low-stock products.");
      }
      const data = await response.json();
      console.log("Low Stock Products Data:", data); // Debugging
      setProducts(data.lowStockProducts || []); // Use the correct key from your API response
    } catch (error) {
      console.error("Error fetching low-stock products:", error);
      alert("Could not fetch low-stock products. Please check the API or server connection.");
    }
  };

  // Add Product to Reorder List
  const addToReorderList = (product) => {
    const alreadyInList = reorderList.some((item) => item.productId === product.productId);
    if (!alreadyInList) {
      setReorderList((prev) => [
        ...prev,
        { ...product, reorderQuantity: product.reorderLevel - product.stock },
      ]);
    }
  };

  // Mark Reorder as Processed
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
          if (!response.ok) {
            throw new Error(`Failed to log stock movement for ${item.name}`);
          }
        })
      );
      alert("Reorder processed successfully!");
      setReorderList([]);
      fetchLowStockProducts(); // Refresh the list
    } catch (error) {
      console.error("Error processing reorder:", error);
      alert("Error processing reorder.");
    }
  };

  // Notify Suppliers
  const notifySuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5000/notify-suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderList }),
      });
      if (response.ok) {
        alert("Suppliers notified successfully!");
      } else {
        throw new Error("Failed to notify suppliers.");
      }
    } catch (error) {
      console.error("Error notifying suppliers:", error);
      alert("Error notifying suppliers.");
    }
  };

  // Toggle Light/Dark Mode
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
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li className="sidebar-item" onClick={() => navigate("/ProductManagement")}>
            Product Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>Inventory Monitoring</li>
          <li className="sidebar-item" onClick={() => navigate("/SupplierManagement")}>
            Supplier Management
          </li>
          <li className="sidebar-item">Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item logout" onClick={() => navigate("/SignIn")}>
            Sign Out
          </li>
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
            <ul className="product-list">
              {products.map((product) => (
                <li key={product.productId}>
                  {product.name} (Stock: {product.stock}, Reorder Level: {product.reorderLevel})
                  <button onClick={() => addToReorderList(product)}>Add to Reorder List</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No low stock products available.</p>
          )}

          <h2>Reorder List</h2>
          {reorderList.length > 0 ? (
            <ul className="reorder-list">
              {reorderList.map((item, index) => (
                <li key={index}>
                  {item.name} (Reorder Quantity: {item.reorderQuantity})
                </li>
              ))}
            </ul>
          ) : (
            <p>No items in reorder list.</p>
          )}

          <button onClick={markAsProcessed}>Mark as Processed</button>
          <button onClick={notifySuppliers}>Notify Suppliers</button>
        </div>
      </main>
    </div>
  );
};

export default ReorderManagement;

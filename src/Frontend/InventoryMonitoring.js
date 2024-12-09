import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InventoryMonitoring.css";
import kadeText from "../images/kade2.png"; // Logo image

const InventoryMonitoring = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [reorderLevels, setReorderLevels] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory");
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      alert("Failed to fetch inventory data.");
    }
  };

  const fetchStockMovements = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventory/${productId}/movements`);
      setStockMovements(response.data);
      setSelectedProduct(productId);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      alert("Failed to fetch stock movements.");
    }
  };

  const updateReorderLevel = async (productId, level) => {
    try {
      await axios.put(`http://localhost:5000/api/inventory/${productId}/reorder-level`, { reorderLevel: level });
      alert("Reorder level updated successfully!");
      fetchInventory();
    } catch (error) {
      console.error("Error updating reorder level:", error);
      alert("Failed to update reorder level.");
    }
  };

  const handleSignOut = () => navigate("/SignIn");

  return (
    <div className="inventory-monitoring">
      <aside className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li className="sidebar-item">Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="active">Inventory Monitoring</li>
          <li className="sidebar-item">Supplier Management</li>
          <li className="sidebar-item">Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item logout" onClick={handleSignOut}>Sign Out</li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1>Inventory Monitoring</h1>
        </header>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Stock Level</th>
              <th>Reorder Level</th>
              <th>Low Stock Alert</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className={item.stock < item.reorderLevel ? "low-stock" : ""}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>{item.reorderLevel}</td>
                <td>{item.stock < item.reorderLevel ? "Yes" : "No"}</td>
                <td>
                  <input
                    type="number"
                    value={reorderLevels[item.id] || item.reorderLevel}
                    onChange={(e) =>
                      setReorderLevels({ ...reorderLevels, [item.id]: e.target.value })
                    }
                  />
                  <button
                    onClick={() => updateReorderLevel(item.id, reorderLevels[item.id] || item.reorderLevel)}
                  >
                    Update
                  </button>
                  <button onClick={() => fetchStockMovements(item.id)}>View Movements</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedProduct && (
          <div className="stock-movements">
            <h2>Stock Movements for Product ID: {selectedProduct}</h2>
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.date}</td>
                    <td>{movement.type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryMonitoring;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./InventoryMonitoring.css";
import kadeText from "../images/kade2.png"; // Logo image
import { useNavigate } from "react-router-dom";

const InventoryMonitoring = () => {
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [reorderLevels, setReorderLevels] = useState({});
  const [selectedProduct, setSelectedProduct] = useState("");
  const [newReorderLevel, setNewReorderLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);

  const navigate = useNavigate();

  // Fetch inventory and stock movements data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryRes = await axios.get("http://localhost:5000/products");
        const stockMovementsRes = await axios.get("http://localhost:5000/stock-movements");
        setInventory(inventoryRes.data.products);
        setStockMovements(stockMovementsRes.data.stockMovements);

        // Initialize reorder levels
        const initialReorderLevels = {};
        inventoryRes.data.products.forEach((item) => {
          initialReorderLevels[item.productId] = item.reorderLevel || 10; // Default reorder level
        });
        setReorderLevels(initialReorderLevels);
        setFilteredInventory(inventoryRes.data.products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Optional: Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update filtered inventory when search term changes
  useEffect(() => {
    const filtered = inventory.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const handleReorderLevelChange = (e) => {
    setNewReorderLevel(e.target.value);
  };

  const handleProductSelect = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleSetReorderLevel = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !newReorderLevel || newReorderLevel <= 0) {
      alert("Please select a product and enter a valid reorder level.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/products/${selectedProduct}`, {
        reorderLevel: parseInt(newReorderLevel),
      });
      alert("Reorder level updated successfully!");

      // Update the inventory and reorder levels in state
      const updatedInventory = response.data.product ? [response.data.product] : [];
      setInventory((prev) =>
        prev.map((item) =>
          item.productId === response.data.product.productId ? response.data.product : item
        )
      );
      setFilteredInventory((prev) =>
        prev.map((item) =>
          item.productId === response.data.product.productId ? response.data.product : item
        )
      );
      setReorderLevels({
        ...reorderLevels,
        [selectedProduct]: parseInt(newReorderLevel),
      });
      setSelectedProduct("");
      setNewReorderLevel("");
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred while updating reorder level.");
    }
  };

  return (
    <div className="inventory-monitoring-container">
      <div className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul>
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li className="sidebar-item" onClick={() => navigate("/ProductManagement")}>
            Product Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>
            Sales Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/InventoryMonitoring")}>
            Inventory Monitoring
          </li>
          <li className="sidebar-item" onClick={() => navigate("/SupplierManagement")}>
            Supplier Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>
            Reorder Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/UserManagement")}>
            User Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/ReportingAndAnalytics")}>Reporting And Analytics</li>
          <li className="sidebar-item" onClick={() => navigate("/SystemSettings")}>System Settings</li>
          <li className="sidebar-item logout" onClick={() => navigate("/SignIn")}>
            Sign Out
          </li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Inventory Dashboard</h1>

        {/* Current Stock Levels */}
        <div className="form-section">
          <h2>Current Stock Levels</h2>
          <div className="search-bar">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product..."
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((product) => (
                <tr
                  key={product.productId}
                  className={
                    product.stock < reorderLevels[product.productId] ? "low-stock" : ""
                  }
                >
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>{reorderLevels[product.productId]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock Movements */}
        <div className="form-section">
          <h2>Stock Movements</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.map((movement, index) => (
                <tr key={index}>
                  <td>{movement.productName}</td>
                  <td>{movement.type}</td>
                  <td>{movement.quantity}</td>
                  <td>{new Date(movement.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Set Reorder Levels */}
        <div className="form-section">
          <h2>Set Reorder Level</h2>
          <form onSubmit={handleSetReorderLevel}>
            <label>
              Select Product:
              <select value={selectedProduct} onChange={handleProductSelect}>
                <option value="">Select a product</option>
                {inventory.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              New Reorder Level:
              <input
                type="number"
                value={newReorderLevel}
                onChange={handleReorderLevelChange}
                placeholder="Enter reorder level..."
              />
            </label>
            <button type="submit">Update Reorder Level</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryMonitoring;

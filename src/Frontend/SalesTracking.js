import React, { useState, useEffect, useCallback } from "react";
import "./SalesTracking.css";
import kadeText from "../images/kade2.png"; // Logo image
import { useNavigate } from "react-router-dom";

const SalesTracking = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([
    { productId: 1, name: "Maliban Biscut", stock: 50, price: 100 },
    { productId: 2, name: "Signal Teeth Past", stock: 30, price: 210 },
    { productId: 3, name: "Samahan", stock: 220, price: 50 },
    { productId: 4, name: "Lux Sope", stock: 220, price: 110 },
    { productId: 5, name: "Gal Arrack", stock: 120, price: 3800 },
    { productId: 6, name: "Jack Daniel", stock: 220, price: 6050 },
  ]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    discount: 0,
  });
  const [summary, setSummary] = useState({ daily: 0, weekly: 0, monthly: 0 });

  const navigate = useNavigate();

  const handleSignOut = () => navigate("/SignIn");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSale = () => {
    const { productId, quantity, discount } = formData;

    if (!productId || !quantity || quantity <= 0) {
      alert("Please enter a valid product and quantity.");
      return;
    }

    const product = inventory.find((item) => item.productId === parseInt(productId));
    if (!product) {
      alert("Product not found.");
      return;
    }

    if (quantity > product.stock) {
      alert("Insufficient stock available.");
      return;
    }

    const totalPrice = product.price * quantity - discount;

    const newSale = {
      productId: parseInt(productId),
      productName: product.name,
      quantity: parseInt(quantity),
      date: new Date().toISOString(),
      totalPrice,
    };

    setSales((prevSales) => [...prevSales, newSale]);

    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.productId === parseInt(productId)
          ? { ...item, stock: item.stock - quantity }
          : item
      )
    );

    setFormData({ productId: "", quantity: "", discount: 0 });
    alert("Sale recorded successfully!");
  };

  const calculateSummary = useCallback(() => {
    const now = new Date();
    const dailySales = sales.filter(
      (sale) => new Date(sale.date).toDateString() === now.toDateString()
    );

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay()); // Set to the start of the week
    const weeklySales = sales.filter(
      (sale) => new Date(sale.date) >= startOfWeek
    );

    const monthlySales = sales.filter(
      (sale) => new Date(sale.date).getMonth() === now.getMonth()
    );

    setSummary({
      daily: dailySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
      weekly: weeklySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
      monthly: monthlySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
    });
  }, [sales]);

  useEffect(() => {
    calculateSummary();
  }, [sales, calculateSummary]);

  return (
    <div className="sales-tracking-container">
      <div className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul>
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li className="sidebar-item">Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>
            Sales Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>
            Inventory Monitoring
          </li>
          <li className="sidebar-item">Supplier Management</li>
          <li className="sidebar-item">Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item logout" onClick={handleSignOut}>
            Sign Out
          </li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Sales Tracking</h1>

        <div className="form-section">
          <h2>Add Sale</h2>
          <form>
            <label>
              Product:
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
              >
                <option value="">Select a product</option>
                {inventory.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Discount:
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
              />
            </label>
            <button type="button" onClick={handleAddSale}>
              Add Sale
            </button>
          </form>
        </div>

        <div className="summary-section">
          <h2>Sales Summary</h2>
          <p>Daily Sales: Rs. {summary.daily.toFixed(2)}</p>
          <p>Weekly Sales: Rs. {summary.weekly.toFixed(2)}</p>
          <p>Monthly Sales: Rs. {summary.monthly.toFixed(2)}</p>
        </div>

        <div className="sales-list">
          <h2>Recent Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={index}>
                  <td>{sale.productName}</td>
                  <td>{sale.quantity}</td>
                  <td>Rs. {sale.totalPrice.toFixed(2)}</td>
                  <td>{new Date(sale.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTracking;

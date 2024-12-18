import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./SalesTracking.css";
import kadeText from "../images/kade2.png"; // Logo image
import kadeText1 from "../images/kade1.png"; // Logo image
import { useNavigate } from "react-router-dom";

const SalesTracking = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    discount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({ totalSales: 0, totalQuantity: 0 });
  const [selectedProductPrice, setSelectedProductPrice] = useState(0); // Track selected product price
  const [showPopup, setShowPopup] = useState(false); // Popup state
  const navigate = useNavigate();

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryRes = await axios.get("http://localhost:5000/products");
        const salesRes = await axios.get("http://localhost:5000/stock-movements");
        setInventory(inventoryRes.data.products || []);
        setSales(salesRes.data.stockMovements || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        alert("Error fetching data. Please check the server.");
      }
    };
    fetchData();
  }, []);

  // Update the summary whenever sales change
  useEffect(() => {
    if (!Array.isArray(sales)) return;
    const summaryData = {
      totalSales: sales.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0),
      totalQuantity: sales.reduce((acc, sale) => acc + (sale.quantity || 0), 0),
    };
    setSummary(summaryData);
  }, [sales]);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "productId") {
      const selectedProduct = inventory.find((p) => p.productId === parseInt(e.target.value));
      setSelectedProductPrice(selectedProduct ? selectedProduct.price : 0);
    }
  };

  // Add a new sale
  const handleAddSale = async () => {
    const { productId, quantity, discount } = formData;
    if (!productId || !quantity || quantity <= 0) {
      alert("Please enter a valid product and quantity.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/stock-movements", {
        productId: parseInt(productId),
        type: "sale",
        quantity: parseInt(quantity),
      });
      const newSale = response.data.newMovement || {};
      setSales([...sales, newSale]);
      setInventory(response.data.updatedInventory);
      setFormData({ productId: "", quantity: "", discount: 0 });
      setShowPopup(true); // Show popup on success
    } catch (err) {
      console.error("Error adding sale:", err.message);
      alert(err.response?.data?.error || "An error occurred while adding the sale.");
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    window.location.reload(); // Refresh the page
  };

   // Convert image to Base64
   const getBase64ImageFromURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };


  // Generate PDF
  const generatePDF = async () => {
    const doc = new jsPDF();

    // Add the logo image to the top-right corner
    const logoBase64 = await getBase64ImageFromURL(kadeText1);
    doc.addImage(logoBase64, "PNG", 150, 10, 50, 50); // Adjust x, y, width, height

    // Title for the report
    doc.setFontSize(18);
    doc.text("Sales Report", 14, 20);

    // Add summary section
    let yPos = 40;
    doc.setFontSize(14);
    doc.text(`Total Sales: Rs. ${summary.totalSales.toFixed(2)}`, 14, yPos);
    yPos += 8;
    doc.text(`Total Quantity: ${summary.totalQuantity}`, 14, yPos);
    yPos += 10;

    // Sales table
    doc.autoTable({
      startY: yPos,
      head: [["Product", "Quantity", "Total Price (Rs.)", "Date"]],
      body: sales.map((sale) => [
        sale.productName || "N/A",
        sale.quantity || "N/A",
        sale.totalPrice ? sale.totalPrice.toFixed(2) : "0.00",
        sale.date ? new Date(sale.date).toLocaleString() : "N/A",
      ]),
      margin: { top: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    // Save the PDF
    doc.save("sales-report.pdf");
  };

  return (
    <div className="sales-tracking-container">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-message">
            <h2>Sale Added Successfully!</h2>
            <p>Please refresh the page to see the latest updates.</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      <div className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul>
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>Dashboard</li>
          <li className="sidebar-item" onClick={() => navigate("/ProductManagement")}>Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>Inventory Monitoring</li>
          <li className="sidebar-item" onClick={() => navigate("/SupplierManagement")}>Supplier Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>Reorder Management</li>
          <li className="sidebar-item" onClick={() => navigate("/UserManagement")}>User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item" onClick={() => navigate("/SystemSettings")}>System Settings</li>
          <li className="sidebar-item logout" onClick={() => navigate("/SignIn")}>Sign Out</li>
        </ul>
      </div>

      <div className="main-content">
        <h1>Sales Tracking</h1>
        <div className="form-section">
          <h2>Add Sale</h2>
          <form>
            <label>
              Search Product:
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product..."
              />
            </label>
            <label>
              Product:
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
              >
                <option value="">Select a product</option>
                {filteredInventory.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price (Rs.):
              <input
                type="text"
                value={selectedProductPrice ? `Rs. ${selectedProductPrice.toFixed(2)}` : "N/A"}
                disabled
              />
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
            <button type="button" onClick={handleAddSale}>Add Sale</button>
          </form>
        </div>

        <div className="summary-section">
          <h2>Sales Summary</h2>
          <p>Total Sales: Rs. {summary.totalSales ? summary.totalSales.toFixed(2) : "0.00"}</p>
          <p>Total Quantity: {summary.totalQuantity}</p>
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
                  <td>{sale.productName || "N/A"}</td>
                  <td>{sale.quantity || "N/A"}</td>
                  <td>Rs. {sale.totalPrice ? sale.totalPrice.toFixed(2) : "0.00"}</td>
                  <td>{sale.date ? new Date(sale.date).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={generatePDF}>Generate PDF</button>
        </div>
      </div>
    </div>
  );
};

export default SalesTracking;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SupplierManagement.css";
import kadeText from "../images/kade2.png"; // Logo image
import { useNavigate } from "react-router-dom";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Function to fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("/api/suppliers");
      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to fetch suppliers. Please try again later.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add or Update Supplier)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    // Frontend validation
    if (!form.name || !form.phone || !form.email || !form.address) {
      setError("All fields are required.");
      return;
    }
    if (!/^\d+$/.test(form.phone)) {
      setError("Phone number must contain only digits.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Invalid email format.");
      return;
    }
  
    try {
      if (editingSupplier) {
        // Update supplier
        await axios.put(`/api/suppliers/${editingSupplier._id}`, form);
        console.log("Supplier updated successfully.");
      } else {
        // Add new supplier
        await axios.post("/api/suppliers", form);
        console.log("Supplier added successfully.");
      }
  
      // Reset form and fetch updated supplier list
      setForm({ name: "", phone: "", email: "", address: "" });
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError(
        error.response?.data?.error || "Failed to save supplier. Please try again."
      );
    }
  };
  
  const handleDelete = async (id) => {
    setError(null);
    try {
      await axios.delete(`/api/suppliers/${id}`);
      console.log("Supplier deleted successfully.");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setError("Failed to delete supplier. Please try again later.");
    }
  };

  // Handle editing a supplier
const handleEdit = (supplier) => {
  setForm({
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
  });
  setEditingSupplier(supplier);
};

  

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sign-out
  const handleSignOut = () => navigate("/SignIn");

  return (
    <div className="supplier-management-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul>
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/ProductManagement")}
          >
            Product Management
          </li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>
            Sales Management
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/inventoryMonitoring")}
          >
            Inventory Monitoring
          </li>
          <li className="sidebar-item">Supplier Management</li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/ReorderManagement")}
          >
            Reorder Management
          </li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/SystemSettings")}
          >
            System Settings
          </li>
          <li className="sidebar-item logout" onClick={handleSignOut}>
            Sign Out
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Supplier Management</h1>
        {error && <div className="error-message">{error}</div>}

        {/* Supplier Form */}
        <div className="form-section">
          <h2>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Supplier name"
                required
              />
            </label>
            <label>
              Phone:
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="Email address"
                required
              />
            </label>
            <label>
              Address:
              <textarea
                name="address"
                value={form.address}
                onChange={handleInputChange}
                placeholder="Address"
                required
              />
            </label>
            <button type="submit">{editingSupplier ? "Update" : "Add"}</button>
          </form>
        </div>

        {/* Search Section */}
        <div className="summary-section">
          <h2>Search Supplier</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
          />
        </div>

        {/* Suppliers List */}
        <div className="suppliers-list">
          <h2>Suppliers List</h2>
          <ul>
            {filteredSuppliers.map((supplier) => (
              <li key={supplier._id}>
                <p>
                  <strong>Name:</strong> {supplier.name}
                </p>
                <p>
                  <strong>Phone:</strong> {supplier.phone}
                </p>
                <p>
                  <strong>Email:</strong> {supplier.email}
                </p>
                <p>
                  <strong>Address:</strong> {supplier.address}
                </p>
                <button onClick={() => handleEdit(supplier)}>Edit</button>
                <button onClick={() => handleDelete(supplier._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement;

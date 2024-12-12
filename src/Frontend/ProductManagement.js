import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductManagement.css";
import kadeText from "../images/kade2.png"; // Logo image

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ productId: "", name: "", price: "", stock: "", category: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products.");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.productId || !newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert("Please fill in all product details.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/products", {
        productId: parseInt(newProduct.productId, 10),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        category: newProduct.category,
      });
      setProducts([...products, response.data.product]);
      setNewProduct({ productId: "", name: "", price: "", stock: "", category: "" });
      alert("Product added successfully.");
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to add product.");
    }
  };

  const handleEditProduct = async (productId) => {
    const productToEdit = products.find((product) => product.productId === productId);

    if (!productToEdit) {
      alert("Product not found.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/products/${productId}`, {
        name: newProduct.name || productToEdit.name,
        price: newProduct.price ? parseFloat(newProduct.price) : productToEdit.price,
        stock: newProduct.stock ? parseInt(newProduct.stock, 10) : productToEdit.stock,
        category: newProduct.category || productToEdit.category,
      });
      setProducts(products.map((product) => (product.productId === productId ? response.data.product : product)));
      setNewProduct({ productId: "", name: "", price: "", stock: "", category: "" });
      alert("Product updated successfully.");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.error || "Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/products/${productId}`);
      setProducts(products.filter((product) => product.productId !== productId));
      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error.response?.data?.error || "Failed to delete product.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter ? product.category.toLowerCase() === filter.toLowerCase() : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="product-management">
      <aside className="sidebar">
        <h2 className="sidebar-title">
          <img src={kadeText} alt="Logo" className="sidebar-logo" />
        </h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => navigate("/Dashboard")}>Dashboard</li>
          <li className="sidebar-item active">Product Management</li>
          <li className="sidebar-item" onClick={() => navigate("/SalesTracking")}>Sales Management</li>
          <li className="sidebar-item" onClick={() => navigate("/inventoryMonitoring")}>Inventory Monitoring</li>
          <li className="sidebar-item">Supplier Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>Reorder Management</li>
          <li className="sidebar-item">User Management</li>
          <li className="sidebar-item">Reporting and Analytics</li>
          <li className="sidebar-item logout" onClick={() => navigate("/SignIn")}>
            Sign Out
          </li>
        </ul>
      </aside>
      <main className="main-content">
        <h1>Product Management</h1>
        <div className="product-form">
          <input
            type="number"
            placeholder="Product ID"
            value={newProduct.productId}
            onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
          />
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <button onClick={handleAddProduct}>Add Product</button>
        </div>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="product-list">
          <h2>Product List</h2>
          {filteredProducts.map((product) => (
            <div
              key={product.productId}
              className={`product-item ${product.stock < 5 ? "low-stock" : ""}`}
            >
              <p>ID: {product.productId}</p>
              <p>Name: {product.name}</p>
              <p>Price: ${product.price.toFixed(2)}</p>
              <p>Stock: {product.stock}</p>
              <p>Category: {product.category}</p>
              <button onClick={() => handleEditProduct(product.productId)}>Edit</button>
              <button onClick={() => handleDeleteProduct(product.productId)}>Delete</button>
            </div>
          ))}
          {filteredProducts.length === 0 && <p>No products found.</p>}
        </div>
      </main>
    </div>
  );
};

export default ProductManagement;

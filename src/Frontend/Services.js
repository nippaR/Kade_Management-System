import React from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";


// Import images
// import inventoryImg from "../assets/inventory.jpg";
// import supplierImg from "../assets/supplier.jpg";
// import salesImg from "../assets/sales.jpg";

const Services = () => {
  const navigate = useNavigate();
  return (
    <div className="services-page">
      <h2 className="h2">Our Services</h2>
      <div className="services-container">
        <div className="service-card">
          {/* <img src={inventoryImg} alt="Inventory Management" /> */}
          <h3>Inventory Management</h3>
          <p className="hi1">
            Effortlessly manage your shop’s inventory with real-time stock updates, low-stock alerts, and tracking tools.
          </p>
        </div>
        <div className="service-card">
          {/* <img src={supplierImg} alt="Supplier Management" /> */}
          <h3>Supplier and Reorder Management</h3>
          <p className="hi1">
            Easily manage supplier contacts and generate reorder lists to restock with ease.
          </p>
        </div>
        <div className="service-card">
          {/* <img src={salesImg} alt="Sales Tracking" /> */}
          <h3>Sales Tracking and Reporting</h3>
          <p className="hi1">
            Track daily, weekly, and monthly sales with ease, helping you stay on top of your business performance.
          </p>
        </div>
      </div>
      <button className="next-button" onClick={() => navigate("/Contact")}>NEXT</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
  
     <footer className="footer1">
        <p>&copy; 2024 KADE Management System. All rights reserved.</p>
        <div className="social-links">
          <a href="#facebook">Facebook</a>
          <a href="#twitter">Twitter</a>
          <a href="#linkedin">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default Services;

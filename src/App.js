import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Frontend/Home";
import About from "./Frontend/About";
import Services from "./Frontend/Services";
import Contact from "./Frontend/Contact";
import SignIn from "./Frontend/SignIn";
import SignUp from "./Frontend/SignUp";
import Dashboard from "./Frontend/Dashboard";
import SalesTracking from "./Frontend/SalesTracking";
import InventoryMonitoring from "./Frontend/InventoryMonitoring"; // Import InventoryMonitoring page
import Report from "./Frontend/Reports & Analytics/Reportpage"; // Import Report page
import ProductManagement from "./Frontend/ProductManagement";
import ReorderManagement from "./Frontend/ReorderManagement";
import SupplierManagement from "./Frontend/SupplierManagement";
import SystemSettings from "./Frontend/SystemSettings";
import UserManagement from "./Frontend/UserManagement";
import ReportingAndAnalytics  from "./Frontend/ReportingAndAnalytics";



const App = () => {
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn onLogin={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/salestracking" element={<SalesTracking />} />
        <Route path="/inventorymonitoring" element={<InventoryMonitoring />} /> {/* Add route for InventoryMonitoring */}
        <Route path="/ProductManagement" element={<ProductManagement />} />
        <Route path="/SupplierManagement" element={<SupplierManagement/>} />
        <Route path="/ReorderManagement" element={<ReorderManagement />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/ReportingAndAnalytics" element={<ReportingAndAnalytics />} />
        <Route path="/SystemSettings" element={<SystemSettings/>} />
        <Route path="/report" element={<Report/>} />
      </Routes>
    </Router>
  );
};

export default App;

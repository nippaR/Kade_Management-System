import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserManagement.css";
import kadeText from "../images/kade2.png"; // Logo image

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState({});
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "Assistant" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserLogs, setSelectedUserLogs] = useState(null);

  useEffect(() => {
    // Fetch initial users
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email) {
      alert("Please fill in all fields.");
      return;
    }

    fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        password: "default1234", // Default password; requires reset
        role: newUser.role,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          setUsers([...users, data.newUser]); // Append new user to the list
          setNewUser({ username: "", email: "", role: "Assistant" });
        }
      })
      .catch((error) => console.error("Error adding user:", error));
  };

  const handleResetPassword = (id, username, email) => {
    fetch(`http://localhost:3000/api/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }), // Send user data to backend
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        const newLog = {
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          activity: "Password Reset",
          description: "Password reset link sent.",
        };
        setActivityLogs({
          ...activityLogs,
          [id]: [...(activityLogs[id] || []), newLog],
        });
      })
      .catch((error) => console.error("Error resetting password:", error));
  };

  const handleSignOut = () => navigate("/SignIn");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query.");
      return;
    }

    fetch(`/api/users/search?query=${searchQuery}`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error searching users:", error));
  };

  const viewActivityLogs = (id) => {
    fetch(`/api/users/${id}/logs`)
      .then((response) => response.json())
      .then((logs) => setSelectedUserLogs({ id, logs }))
      .catch((error) => console.error("Error fetching logs:", error));
  };

  const closeLogsModal = () => {
    setSelectedUserLogs(null);
  };

  return (
    <div className="user-management">
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
          <li className="sidebar-item" onClick={() => navigate("/ReorderManagement")}>Reorder Management</li>
          <li className="sidebar-item" onClick={() => navigate("/UserManagement")}>User Management</li>
          <li className="sidebar-item" onClick={() => navigate("/ReportingAndAnalytics")}>Reporting And Analytics</li>
          <li className="sidebar-item" onClick={() => navigate("/SystemSettings")}>System Settings</li>
          <li className="sidebar-item logout" onClick={handleSignOut}>Sign Out</li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1>User Management</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>🔍</button>
          </div>
        </header>

        <section className="user-list">
          <h2>Users</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users
                  .filter((user) => user && user._id) // Filter out invalid entries
                  .map((user) => (
                    <tr key={user._id}>
                      <td>{user._id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button onClick={() => handleResetPassword(user._id, user.username, user.email)}>Reset Password</button>
                        <button onClick={() => viewActivityLogs(user._id)}>View Logs</button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="add-user">
          <h2>Add New User</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Admin">Admin</option>
              <option value="Assistant">Assistant</option>
            </select>
            <button onClick={handleAddUser}>Add User</button>
          </div>
        </section>

        {selectedUserLogs && (
          <div className="modal">
            <div className="modal-content">
              <h2>Activity Logs for User {selectedUserLogs.id}</h2>
              {selectedUserLogs.logs.length > 0 ? (
                <ul>
                  {selectedUserLogs.logs.map((log, index) => (
                    <li key={index}>
                      <strong>{log.timestamp}</strong> - {log.activity}: {log.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No logs available.</p>
              )}
              <button onClick={closeLogsModal}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;

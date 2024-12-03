import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Frontend/Home";
import About from "./Frontend/About";
import Services from "./Frontend/Services";
import Contact  from "./Frontend/Contact";
import SignIn  from "./Frontend/SignIn";
import SignUp  from "./Frontend/SignUp";
import Dashboard from "./Frontend/Dashboard";




const App = () => {
  const [user, setUser] = React.useState(null);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn onLogin={setUser} />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;

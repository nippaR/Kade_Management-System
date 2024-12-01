import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import animate1 from "../images/animate1.png";

const Home = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div>
      <div className="home">
        <div className="text-container">
          <h1 className="title">
            KADE <br />
            MANAGEMENT <br />
            SYSTEM
          </h1>
          <p className="subtitle">For Easy Life</p>
        </div>

        <div className="image-container">
          <img src={animate1} alt="Decorative" className="decorative-image" />
        </div>

        {/* Updated Button */}
        <button className="get-start-btn" onClick={() => navigate("/about")}>
          GET START
        </button>
      </div>

      <footer className="footer">
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

export default Home;

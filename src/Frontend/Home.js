import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import animate1 from "../images/animate1.png";
import kadeText from "../images/kade2.png"; // Import the Sinhala text image
import demoVideo from "../videos/demo.mp4"; // Import the video file

const Home = () => {
  const navigate = useNavigate(); // Hook for navigation

  

  return (
    <div>
      <div className="home">
        <div className="text-container">
          <h1 className="title">
            <img src={kadeText} alt="KADE" className="kade-text-image" />
            <br />
            MANAGEMENT <br />
            SYSTEM
          </h1>
          <p className="subtitle">For Easy Life</p>

          {/* Video Element */}
          <div className="video-container">
            <video
              src={demoVideo}
              className="intro-video"
              controls
              loop
              playsInline
            ></video>

          </div>
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
        <p>&copy; 2024 KADE.LK Management System. All rights reserved.</p>
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

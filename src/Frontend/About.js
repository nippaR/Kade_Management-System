import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";


  


const About = () => {
  const navigate = useNavigate();
  return (
    <div className="about-page">
      <div className="content">
        
        <div className="text-section">
          <h1>About Kade Management System</h1>
          <br></br>
          <p className="text">
            Welcome to the <strong>Kade Management System</strong>, a purpose-built digital
            solution designed to empower small and medium-sized retail businesses. Our
            platform simplifies inventory management, sales tracking, and supplier
            coordination, making it easier for shop owners to focus on growing their
            business.
          </p>
          <br></br>
          <p className="text">
            With features like low-stock alerts, sales analytics, and streamlined reorder
            processes, our system ensures your shop runs smoothly and efficiently.
            Recognizing the unique challenges faced by small-scale businesses in Sri Lanka,
            we are committed to providing an intuitive, affordable, and reliable solution
            that bridges the gap between traditional operations and modern technology.
          </p>
          <br></br>
          <p className="text">
            Join us in transforming the way you manage your retail store. Together, we can
            drive your business toward greater success!
          </p>
        </div>
      </div>
      <button className="next-button" onClick={() => navigate("/services")}>NEXT</button>
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

export default About;

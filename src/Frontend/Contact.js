import React from "react";
import "./Contact.css";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h1 className="contact-title">Contact Us</h1>
          <div className="contact-details">
            <p>
              <strong>PHONE</strong>
              <br />
              (+94) 77 456 1111
            </p>
            <p>
              <strong>EMAIL</strong>
              <br />
              kademanagement@gmail.com
            </p>
            <p>
              <strong>SOCIAL</strong>
              <br />
              <div className="social-icons">
                <a href="#instagram" className="social-link">
                  <i className="fa fa-instagram"></i>
                </a>
                <a href="#tumblr" className="social-link">
                  <i className="fa fa-tumblr"></i>
                </a>
                <a href="#pinterest" className="social-link">
                  <i className="fa fa-pinterest"></i>
                </a>
                <a href="#facebook" className="social-link">
                  <i className="fa fa-facebook"></i>
                </a>
              </div>
            </p>
          </div>
        </div>

        <div className="contact-animation">
          <img
            src={require("../assets/globe-placeholder.png")}
            alt="3D Globe"
            className="globe-image"
          />
        </div>
      </div>

      <button className="next-button" onClick={() => navigate("/SignIn")}>
        NEXT
      </button>

      <div className="image-section">
        <img
          src={require("../assets/contact-background.png")}
          alt="Decorative Globe Background"
          className="decorative-image"
        />
      </div>

      <footer className="footer3">
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

export default Contact;

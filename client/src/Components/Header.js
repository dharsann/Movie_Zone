import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
      // Send a request to the server to log the logout action
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Remove the token from localStorage
      localStorage.removeItem("token");
  
      // Update isLoggedIn state
      setIsLoggedIn(false);
  
      // Redirect to the signin page
      navigate("/signin");
  };
  
  useEffect(() => {
    // Check if the user is logged in based on the presence of a session token
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [localStorage.getItem("token")]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between align-items-center w-100 text-uppercase p-3 header">
          <div>
            <i className="fas fa-video"></i> &nbsp;&nbsp;The Movie Zone
          </div>
          {isLoggedIn && (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

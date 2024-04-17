import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const navigate = useNavigate();

  const handleSignup = async () => {
    setIsLoading(true); // Set loading state to true when signup process starts
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      setIsRegistered(true);
    } catch (error) {
      setError(error.message || "An error occurred during signup");
    } finally {
      setIsLoading(false); // Set loading state back to false when signup process finishes
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        {isRegistered ? (
          <div>
            <h2>Registration Successful!</h2>
            <Link to="/signin" className="btn btn-primary">
              Login
            </Link>
          </div>
        ) : (
          <div>
            <h2>Sign Up</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
            <br />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
            />
            <br />
            {/* Disable the button when loading */}
            <button onClick={handleSignup} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
            {error && <div className="text-danger">{error}</div>}
            <br />
            <br />
            <Link to="/signin">Already have an account? Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;

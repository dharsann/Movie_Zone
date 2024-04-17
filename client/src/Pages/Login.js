import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Storing the token in localStorage after successful login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Set token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true"); // Set isLoggedIn flag

        onLogin(); // Call the onLogin callback function passed from App
        navigate('/trending'); // Redirect to trending page
      } else {
        setError(data.msg || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div>
          <h2>Login</h2>
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
          <button onClick={handleLogin} className="btn btn-primary">
            Login
          </button>
          {error && <div className="text-danger">{error}</div>}
          <br />
          <br />
          <Link to="/signup">Don't have an account? Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

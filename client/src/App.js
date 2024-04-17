import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "../src/Components/Header";
import Footer from "../src/Components/Footer";
import Trending from "../src/Pages/Trending";
import Movies from "../src/Pages/Movies";
import TV from "../src/Pages/TV";
import Search from "../src/Pages/Search";
import Error from "../src/Pages/Error";
import Login from "../src/Pages/Login";
import Signup from "../src/Pages/Signup";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Listen for changes to isLoggedIn flag in localStorage
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(loggedIn === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    // Initialize isLoggedIn state based on localStorage
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/trending" /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/signup" element={<Signup />} />
        {isLoggedIn && (
          <>
            <Route path="/trending" element={<Trending />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TV />} />
            <Route path="/search" element={<Search />} />
          </>
        )}
        <Route path="*" element={<Error />} />
        <Route path="/signin" element={<Login onLogin={handleLogin} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

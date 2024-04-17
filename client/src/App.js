import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Trending from "./Pages/Trending";
import Movies from "./Pages/Movies";
import TV from "./Pages/TV";
import Search from "./Pages/Search";
import Error from "./Pages/Error";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

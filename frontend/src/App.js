import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UrlShortener from "./UrlShortener";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UrlShortener />} />
        {/* You can later add more routes like a dedicated stats page here */}
      </Routes>
    </Router>
  );
};

export default App;

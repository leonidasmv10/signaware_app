import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ROUTES } from "./config/routes";
import Home from "./components/Home";
import AudioStream from "./components/Audio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<AudioStream />} />
      </Routes>
      <Routes>
        <Route path={ROUTES.AUDIO} element={<AudioStream />} />
      </Routes>
    </Router>
  );
}

export default App;

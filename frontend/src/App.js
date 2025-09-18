import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopicsPage from "./components/TopicsPage";
import ArgumentsPage from "./components/ArgumentsPage";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TopicsPage />} />
          <Route path="/topic/:topicId" element={<ArgumentsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

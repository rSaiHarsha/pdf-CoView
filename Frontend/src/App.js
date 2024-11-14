import React, { useState, useEffect, createContext, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PdfUpload from "./components/PdfUpload";
import PdfComp from "./components/PdfComp";
import RoleSelection from "./components/RoleSelection";
import "./App.css";

// Create a Context for the Role
export const RoleContext = createContext();

const socket = new WebSocket("ws://localhost:5000");

function App() {
  const [role, setRole] = useState(null); // Track user role (admin or user)
  const appRef = useRef(null); // Reference for the app container

  useEffect(() => {
    socket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, []);

  if (!role) {
    return <RoleSelection setMode={setRole} />; // Render RoleSelection if no role is selected
  }

 

  return (
    <RoleContext.Provider value={role}> {/* Provide role to all components */}
      <Router>
        <div className="App" ref={appRef}>
          <Routes>
            <Route
              path="/"
              element={role === "admin" ? <PdfUpload /> : <PdfComp />}
            />
            <Route path="/pdf-viewer" element={<PdfComp />} />
          </Routes>

         
        </div>
      </Router>
    </RoleContext.Provider>
  );
}

export default App;

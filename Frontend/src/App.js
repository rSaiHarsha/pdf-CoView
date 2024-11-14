import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PdfUpload from "./components/PdfUpload";
import PdfComp from "./components/PdfComp";

const socket = new WebSocket("ws://localhost:5000"); // WebSocket connection to the backend

function App() {
  // Send a message to the server (example function)
  // const sendMessage = function () {
  //   const message = JSON.stringify({ type: "client-msg", message: "this is from client" });
  //   socket.send(message); // Send message to server
  // };

  // Log connection status and handle cleanup
  useEffect(() => {
    socket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "updatePage") {
        console.log(`Page synced to: ${data.pageNumber}`);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <Router>
      <div className="App">
       
        <Routes>
          <Route path="/" element={<PdfUpload />} />
          <Route path="/pdf-viewer" element={<PdfComp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

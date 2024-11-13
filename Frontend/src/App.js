
// import React  from "react";
// import PdfUpload from "./components/PdfUpload";
// import io from 'socket.io-client'
// function App() {
//   const socket = io('http://localhost:5000');

//   const sendMessage = function () {
//       socket.emit("client-msg","this is from client")
//   }
//   return (
//     <div className="App">
//       <button onClick={sendMessage}>send msg</button>
//       <br />
//       <PdfUpload/>
//     </div>
//   );
// }

// export default App;

// frontend/src/App.js

import React, { useEffect } from "react";
import PdfUpload from "./components/PdfUpload";
import io from 'socket.io-client';

function App() {
  // Connect to the backend server with Socket.IO
  const socket = io('http://localhost:5000');

  // Send a message to the server
  const sendMessage = function () {
    socket.emit("client-msg", "this is from client");
  };

  // Log connection status and handle cleanup
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  return (
    <div className="App">
      <button onClick={sendMessage}>Send Message to Server</button>
      <br />
      <PdfUpload />
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";

import pdf from "./1.pdf"; // Fallback PDF file

let socket;

function PdfComp({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    // Initialize WebSocket connection if not already open
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      socket = new WebSocket("ws://localhost:5000");

      socket.onopen = () => {
        console.log("Connected to WebSocket server in PdfComp");
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket server in PdfComp");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "updatePage") {
          setPageNumber(data.pageNumber); // Update page number from server message
        }
      };
    }

    // Clean up WebSocket connection on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message)); // Send message to server
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  }

  function goToNextPage() {
    if (pageNumber < numPages) {
      const newPageNumber = pageNumber + 1;
      setPageNumber(newPageNumber);
      sendMessage({ type: "syncPage", pageNumber: newPageNumber });
    }
  }

  function goToPrevPage() {
    if (pageNumber > 1) {
      const newPageNumber = pageNumber - 1;
      setPageNumber(newPageNumber);
      sendMessage({ type: "syncPage", pageNumber: newPageNumber });
    }
  }

  return (
    <div className="pdf-div">
      <p>
        Page {pageNumber} of {numPages}
      </p>
      <Document file={pdfFile || pdf} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div>
        <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
          Previous
        </button>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default PdfComp;

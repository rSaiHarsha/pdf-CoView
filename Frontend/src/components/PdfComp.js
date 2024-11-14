import React, { useState, useEffect, useContext, useRef } from "react";
import { Document, Page } from "react-pdf";
import { useLocation } from "react-router-dom";
import { RoleContext } from "../App"; // Import the context
import pdf from "./1.pdf"; // Fallback PDF file
import "./PdfComp.css";

let socket;

function PdfComp() {
  const location = useLocation();
  const role = useContext(RoleContext); // Get the role from context

  const [currentPdf, setCurrentPdf] = useState(location.state?.pdfFile || pdf); // Current PDF file to display
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
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

        if (data.type === "updatePdf") {
          setCurrentPdf(data.pdf);
          setPageNumber(data.pageNumber);
        } else if (data.type === "updatePage") {
          setPageNumber(data.pageNumber);
        }
      };
    }

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
      socket.send(JSON.stringify(message));
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

  // Full-Screen toggle function for the entire page
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen mode for the entire document
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen(); // Standard
      } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <div className="pdf-div">
      {/* Page Number Display */}
      <p className="pdf-page-number">
        Page {pageNumber} of {numPages}
      </p>

      {/* PDF Document */}
      <Document className="pdf-document" file={currentPdf || pdf} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          className="pdf-page"
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>

      {/* Navigation Buttons (Only visible for admin) */}
      {role === "admin" && (
        <div className="pdf-navigation">
          <button
            className="btn btn-primary"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-success"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>

          {/* Full-Screen toggle button */}
          <button className="fullscreen-btn" onClick={toggleFullScreen}>
            {document.fullscreenElement ? "Exit Full-Screen" : "Go Full-Screen"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PdfComp;

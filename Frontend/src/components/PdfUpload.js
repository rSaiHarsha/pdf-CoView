import React, { useState, useEffect } from "react";
import axios from "axios";
import { pdfjs } from "react-pdf";
import PdfComp from "./PdfComp";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function PdfUpload() {  // Rename this function to start with an uppercase letter
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [allImage, setAllImage] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    try {
      const result = await axios.get("http://localhost:5000/get-files");
      console.log(result.data.data);
      setAllImage(result.data.data || []);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert("Please provide both title and file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    console.log(title, file);

    try {
      const result = await axios.post(
        "http://localhost:5000/upload-files",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(result);
      if (result.data.status === "ok") {
        alert("Uploaded Successfully!!!");
        getPdf(); // Refresh the list of PDFs
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  const showPdf = (pdf) => {
    setPdfFile(`http://localhost:5000/files/${pdf}`);
  };

  return (
    <>
      <form className="formStyle" onSubmit={submitImage}>
        <h4>Upload PDF in React</h4>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          className="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>

      <div className="uploaded">
        <h4>Uploaded PDFs:</h4>
        <div className="output-div">
          {allImage.length === 0 ? (
            <p>No PDFs available.</p>
          ) : (
            allImage.map((data) => (
              <div className="inner-div" key={data._id}>
                <h6>Title: {data.title}</h6>
                <button
                  className="btn btn-primary"
                  onClick={() => showPdf(data.pdf)}
                >
                  Show PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {pdfFile && <PdfComp pdfFile={pdfFile} />}
    </>
  );
}

export default PdfUpload;

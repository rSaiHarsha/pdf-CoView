const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http");
const WebSocket = require("ws");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const mongoUrl = "mongodb://localhost:27017/pdf-viewer";

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PdfSchema = mongoose.model(
  "PdfDetails",
  new mongoose.Schema({
    title: String,
    pdf: String,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./files"),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname),
});
const upload = multer({ storage });

let currentPdf = null;
let currentPageNumber = 1;

// Upload file route
app.post("/upload-files", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const fileName = req.file.filename;

  try {
    const existingPdf = await PdfSchema.findOne({});
    if (existingPdf) {
      const previousFilePath = `./files/${existingPdf.pdf}`;
      if (fs.existsSync(previousFilePath)) {
        fs.unlinkSync(previousFilePath);
      }
      await PdfSchema.findOneAndUpdate({}, { title, pdf: fileName }, { upsert: true });
    } else {
      await PdfSchema.create({ title, pdf: fileName });
    }

    currentPdf = `http://localhost:5000/files/${fileName}`;
    currentPageNumber = 1;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "updatePdf", pdf: currentPdf, pageNumber: currentPageNumber }));
      }
    });

    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Fetch uploaded PDFs
app.get("/get-files", async (req, res) => {
  try {
    const pdfs = await PdfSchema.find({});
    res.json({ status: "ok", data: pdfs });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("A user connected");

  if (currentPdf) {
    ws.send(JSON.stringify({ type: "updatePdf", pdf: currentPdf, pageNumber: currentPageNumber }));
  }

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "syncPage") {
      currentPageNumber = parsedMessage.pageNumber;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "updatePage", pageNumber: currentPageNumber }));
        }
      });
    }
  });

  ws.on("close", () => console.log("User disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));

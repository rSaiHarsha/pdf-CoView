const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http");
const WebSocket = require("ws"); // Use ws instead of socket.io
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

const mongoUrl = "mongodb://localhost:27017";
mongoose.connect(mongoUrl, { useNewUrlParser: true }).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => console.error("MongoDB connection error:", err));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
const upload = multer({ storage });

const PdfSchema = mongoose.model("PdfDetails", new mongoose.Schema({
  title: String,
  pdf: String,
}));

// Upload file route
app.post("/upload-files", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const fileName = req.file.filename;

  try {
    const existingPdf = await PdfSchema.findOne({});
    if (existingPdf) {
      const previousFilePath = `./files/${existingPdf.pdf}`;
      if (fs.existsSync(previousFilePath)) {
        fs.unlinkSync(previousFilePath); // Delete the old file
      }
      await PdfSchema.findOneAndUpdate({}, { title, pdf: fileName }, { upsert: true });
    } else {
      await PdfSchema.create({ title, pdf: fileName });
    }
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

// WebSocket server for page synchronization using ws
wss.on("connection", (ws) => {
  console.log("A user connected");

  ws.on("message", (message) => {
    // Parse message if necessary
    const parsedMessage = JSON.parse(message);
    
    if (parsedMessage.type === "syncPage") {
      console.log(`Syncing page to: ${parsedMessage.pageNumber}`);
      // Broadcast the page number to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "updatePage", pageNumber: parsedMessage.pageNumber }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});

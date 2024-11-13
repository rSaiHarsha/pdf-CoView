

// // version 3 
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// app.use(express.json());
// const cors = require("cors");
// app.use(cors());
// app.use("/files", express.static("files"));
// //mongodb connection----------------------------------------------
// const mongoUrl =
//   "mongodb://localhost:27017";

// mongoose
//   .connect(mongoUrl, {
//     useNewUrlParser: true,
//   })
//   .then(() => {
//     console.log("Connected to database");
//   })
//   .catch((e) => console.log(e));
// //multer------------------------------------------------------------
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./files");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./pdfDetails");
// const PdfSchema = mongoose.model("PdfDetails");
// const upload = multer({ storage: storage });

// app.post("/upload-files", upload.single("file"), async (req, res) => {
//   console.log(req.file);
//   const title = req.body.title;
//   const fileName = req.file.filename;
//   try {
//     await PdfSchema.create({ title: title, pdf: fileName });
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

// app.get("/get-files", async (req, res) => {
//   try {
//     PdfSchema.find({}).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });

// //apis----------------------------------------------------------------
// app.get("/", async (req, res) => {
//   res.send("Success!!!!!!");
// });

// app.listen(5000, () => {
//   console.log("Server Started");
// });


//version 2 

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// app.use(express.json());
// const cors = require("cors");
// app.use(cors());
// app.use("/files", express.static("files"));



// // MongoDB connection
// const mongoUrl = "mongodb://localhost:27017";
// mongoose
//   .connect(mongoUrl, {
//     useNewUrlParser: true,
//   })
//   .then(() => {
//     console.log("Connected to database");
//   })
//   .catch((e) => console.log(e));

// // Multer setup
// const multer = require("multer");
// const fs = require("fs");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./files");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./pdfDetails");
// const PdfSchema = mongoose.model("PdfDetails");
// const upload = multer({ storage: storage });

// // Route to upload files
// app.post("/upload-files", upload.single("file"), async (req, res) => {
//   const title = req.body.title;
//   const fileName = req.file.filename;

//   try {
//     // Delete the previous file if it exists
//     const previousPdf = await PdfSchema.findOne({});
//     if (previousPdf) {
//       const previousFilePath = `./files/${previousPdf.pdf}`;
//       if (fs.existsSync(previousFilePath)) {
//         fs.unlinkSync(previousFilePath);  // Delete the old file
//       }
//       // Update the existing record in the database
//       await PdfSchema.findOneAndUpdate(
//         {},
//         { title: title, pdf: fileName },
//         { upsert: true } // Ensure it will create the document if not present
//       );
//     } else {
//       // If no PDF exists, create a new one
//       await PdfSchema.create({ title: title, pdf: fileName });
//     }

//     res.send({ status: "ok" });
//   } catch (error) {
//     console.log("error");
//     console.error("Error uploading file:", error);
    
//     res.json({ status: "error", message: error.message });
//   }
// });

// // Route to get the current PDF file
// app.get("/get-files", async (req, res) => {
//   try {
//     const data = await PdfSchema.findOne({});
//     if (data) {
//       res.send({ status: "ok", data: [data] }); // Return the single file in an array
//     } else {
//       res.send({ status: "ok", data: [] });
//     }
//   } catch (error) {
//     console.error("Error fetching PDFs:", error);
//     res.send({ status: "error", message: error.message });
//   }
// });

// // Default route
// app.get("/", async (req, res) => {
//   res.send("Success!!!!!!");
// });

// app.listen(5000, () => {
//   console.log("Server Started");
// });


// backend/server.js

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require('http');
const socketIo = require('socket.io');
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

app.use(express.json());
app.use(cors());  // Allow all origins, you can configure it to allow specific origins if needed
app.use("/files", express.static("files"));

// Create an HTTP server with Express and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection setup
const mongoUrl = "mongodb://localhost:27017";
mongoose
  .connect(mongoUrl, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });

require("./pdfDetails");  // Make sure this file defines the PdfSchema
const PdfSchema = mongoose.model("PdfDetails");

// Route to upload files
app.post("/upload-files", upload.single("file"), async (req, res) => {
  const title = req.body.title;
  const fileName = req.file.filename;

  try {
    const previousPdf = await PdfSchema.findOne({});
    if (previousPdf) {
      const previousFilePath = `./files/${previousPdf.pdf}`;
      if (fs.existsSync(previousFilePath)) {
        fs.unlinkSync(previousFilePath);  // Delete the old file
      }
      await PdfSchema.findOneAndUpdate(
        {},
        { title: title, pdf: fileName },
        { upsert: true }
      );
    } else {
      await PdfSchema.create({ title: title, pdf: fileName });
    }

    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.json({ status: "error", message: error.message });
  }
});

// Route to get the current PDF file
app.get("/get-files", async (req, res) => {
  try {
    const data = await PdfSchema.findOne({});
    if (data) {
      res.send({ status: "ok", data: [data] });
    } else {
      res.send({ status: "ok", data: [] });
    }
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    res.send({ status: "error", message: error.message });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log("A user connected");

  socket.on("client-msg", (msg) => {
    console.log("Message from client:", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server started on port 5000");
});

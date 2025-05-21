import express from "express";
import axios from "axios";
import cors from "cors";

// Define __dirname for ES modules

const app = express();
app.use(cors()); // Enable CORS for your frontend

app.get("/api/suggestions", async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`
    );
    res.json(response.data[1]); // Return suggestions
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// app.get("/api/shortcuts", (_, res) => {
//   const filePath = path.join(__dirname, "./db/shortcutsData.json");
//   fs.readFile(filePath, "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading shortcuts file:", err);
//       res.status(500).json({ error: "Failed to fetch shortcuts" });
//     } else {
//       res.json(JSON.parse(data));
//     }
//   });
// });

app.listen(3001, () =>
  console.log("Proxy server running on http://localhost:3001")
);

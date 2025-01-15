import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Serve static files from dist directory
app.use(express.static("dist"));

// Handle all routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(3002, () => {
  console.log("Test server running on http://localhost:3002");
});

// index.js - File-based backend with JSON storage

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;
const DB_FILE = path.join(__dirname, "url_data.json");

app.use(cors());
app.use(express.json());

// Logging middleware with token
app.use((req, res, next) => {
  const token = req.headers['authorization'] || 'No Token';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Token: ${token}`);
  next();
});

// Utility to read/write file DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// POST /api/shorten
app.post("/api/shorten", (req, res) => {
  const { originalUrl, validity = 30, shortcode } = req.body;
  const data = readDB();

  if (!originalUrl || !originalUrl.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let shortCode = shortcode || generateShortCode();
  if (data[shortCode]) {
    return res.status(409).json({ error: "Shortcode already exists" });
  }

  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + validity * 60 * 1000).toISOString();

  data[shortCode] = {
    originalUrl,
    createdAt,
    expiresAt,
    clicks: [],
  };

  writeDB(data);

  res.json({ shortUrl: `http://localhost:${port}/${shortCode}` });
});

// GET /:shortcode (redirect)
app.get("/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const data = readDB();
  const entry = data[shortcode];

  if (!entry) return res.status(404).send("Shortcode not found");

  const now = new Date();
  if (new Date(entry.expiresAt) < now) {
    return res.status(410).send("Link expired");
  }

  entry.clicks.push({
    timestamp: new Date().toISOString(),
    referrer: req.get("Referrer") || "Direct",
  });

  data[shortcode] = entry;
  writeDB(data);

  res.redirect(entry.originalUrl);
});

// GET /api/stats/:shortcode
app.get("/api/stats/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const data = readDB();
  const entry = data[shortcode];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  res.json({
    shortcode,
    original_url: entry.originalUrl,
    created_at: entry.createdAt,
    expires_at: entry.expiresAt,
    click_count: entry.clicks.length,
    clicks: entry.clicks,
  });
});

app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
